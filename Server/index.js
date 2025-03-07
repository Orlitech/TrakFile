const express = require('express');
const app = express();
const port = 5020;
const pool = require('./dbconnection');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const ExcelJS = require('exceljs');
app.use(cors());
app.use(express.json());

// ROUTE
app.get('/weekly-trend', async (req, res) => {
  try {
    const { week } = req.query; // Expects a date in YYYY-MM-DD format
    const startOfWeek = new Date(week);
    if (isNaN(startOfWeek.getTime())) {
      throw new Error("Invalid date format");
    }
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the week (Sunday)

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // End of the week (Saturday)

    // Query to fetch data for the selected week
    const query = `
      SELECT 
        Date(DATE_TRUNC('day', date_collected)) AS date,
        COUNT(*) AS files_moved
      FROM folder_transactions
      WHERE date(date_collected) >= $1 AND date(date_collected) <= $2
      GROUP BY date(DATE_TRUNC('day', date_collected))
      ORDER BY date ASC;
    `;

    const result = await pool.query(query, [startOfWeek, endOfWeek]);

    if (result.rows.length === 0) {
      // If no data for the selected week, fetch data for the last week with transactions
      const fallbackQuery = `
        SELECT 
          Date(DATE_TRUNC('day', date_collected)) AS date,
          COUNT(*) AS files_moved
        FROM folder_transactions
        WHERE date_collected < $1
        GROUP BY DATE_TRUNC('day', date_collected)
        ORDER BY date DESC
        LIMIT 7;
      `;

      const fallbackResult = await pool.query(fallbackQuery, [startOfWeek]);
      res.json(fallbackResult.rows.reverse()); // Return the last week's data
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching weekly trend data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/assign', async (req, res) => {
  const { folder_id, purpose_id, collectedby, date_collected } = req.body;

  // Validate input
  if (!Array.isArray(folder_id) || folder_id.length === 0) {
    return res.status(400).json({ message: "Invalid input: 'folder_id' must be a non-empty array" });
  }

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    const assignedFolders = [];

    for (const folderId of folder_id) {
      // Check the latest folder status
      const statusQuery = `
        SELECT folder_status 
        FROM folder_transactions 
        WHERE folder_id = $1 
        ORDER BY date_collected DESC 
        LIMIT 1;
      `;
      const statusResult = await client.query(statusQuery, [folderId]);
      const folderStatus = statusResult.rows.length ? statusResult.rows[0].folder_status : 'In Store';

      // If folder is "Out Store", prevent assignment
      if (folderStatus === 'Out Store') {
        throw new Error(`Folder ID ${folderId} is currently 'Out Store' and cannot be assigned.`);
      }

      // Insert new transaction
      const insertQuery = `
        INSERT INTO folder_transactions (folder_id, purpose_id, collectedby, date_collected, folder_status)
        VALUES ($1, $2, $3, $4, 'Out Store') 
        RETURNING folder_id;
      `;
      const insertResult = await client.query(insertQuery, [folderId, purpose_id, collectedby, date_collected]);

      assignedFolders.push(insertResult.rows[0].folder_id);
    }

    // Commit transaction
    await client.query("COMMIT");

    return res.status(200).json({ message: 'Folders assigned successfully', assignments: assignedFolders });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error('Error assigning folders:', error);
    return res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});


// Return folder (mark it as returned)
app.post('/return-folder', async (req, res) => {
  const { ftId, returnDate } = req.body;

  // Validate input
  if (!Array.isArray(ftId) || ftId.length === 0 || !returnDate) {
    return res.status(400).json({ message: "Invalid input: 'ftId' must be a non-empty array, and 'returnDate' is required." });
  }

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    const returnedFolders = [];

    for (const id of ftId) {
      const updateQuery = `
        UPDATE folder_transactions
        SET date_returned = $1, folder_status = 'In Store'
        WHERE folder_id = $2 RETURNING folder_id;
      `;
      const updateResult = await client.query(updateQuery, [returnDate, id]);

      if (updateResult.rowCount === 0) {
        throw new Error(`Invalid ftId ${id}: No matching record found.`);
      }

      returnedFolders.push(updateResult.rows[0].folder_id);
    }

    // Commit transaction
    await client.query("COMMIT");

    return res.json({ message: "Folders returned successfully", returnedFolders });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: error.message || "An error occurred while processing the request." });
  } finally {
    client.release();
  }
});


// Fetch overdue folders with collector details
// Get overdue folders with Excel export
app.get('/overdue-folders', async (req, res) => {
  try {
    const { page = 1, limit = 10, collectorName } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        fc.first_name || ' ' || COALESCE(fc.other_name, '') AS collector_name, 
        fc.phone, 
        COUNT(ft.ft_id) AS overdue_count,
        DATE_PART('day', NOW() - MIN(ft.date_collected)) AS overdue_days,
        array_agg(fr.hospital_number || ' - Collected: ' || TO_CHAR(ft.date_collected, 'YYYY-MM-DD')) AS folder_list
      FROM folder_transactions ft
      JOIN folder_registration fr ON fr.id = ft.folder_id
      JOIN folder_collectors fc ON ft.collectedby = fc.foco_id
      WHERE ft.date_returned IS NULL 
        AND ft.folder_status = 'Out Store' 
        AND ft.date_collected < NOW() - INTERVAL '2 days'
    `;

    if (collectorName) {
      query += ` AND fc.first_name ILIKE $1`;
    }

    query += `
      GROUP BY fc.foco_id, fc.first_name, fc.other_name, fc.phone
      LIMIT $${collectorName ? 2 : 1} OFFSET $${collectorName ? 3 : 2}
    `;

    const params = collectorName ? [`%${collectorName}%`, limit, offset] : [limit, offset];
    const result = await pool.query(query, params);
    const overdueFolders = result.rows;

    if (overdueFolders.length === 0) {
      return res.status(200).json({ message: 'No overdue folders found.' });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Overdue Folders');

    worksheet.columns = [
      { header: 'Collector Name', key: 'collector_name', width: 25 },
      { header: 'Phone Number', key: 'phone', width: 15 },
      { header: 'Overdue Count', key: 'overdue_count', width: 15 },
      { header: 'Overdue Days', key: 'overdue_days', width: 15 },
      { header: 'Folder List', key: 'folder_list', width: 50 }
    ];

    overdueFolders.forEach(folder => worksheet.addRow(folder));

    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, 'overdue_folders.xlsx');

    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'overdue_folders.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ message: 'Error generating Excel file' });
      }

      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 5000);
    });

  } catch (error) {
    next(error);
  }
});

// Count overdue folders
app.get('/overdue-folders/count', async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) AS total_overdue
      FROM folder_transactions 
      WHERE date_returned IS NULL 
        AND folder_status = 'Out Store' 
        AND date_collected < NOW() - INTERVAL '2 days'
    `;

    const { rows } = await pool.query(query);
    res.json({ overdue_count: rows[0].total_overdue });

  } catch (error) {
    next(error);
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});



app.get('/reminders', async (req, res) => {
  try {
    const query = `
      SELECT 
        fr.id AS folder_id,
        fr.hospital_number AS folder_name,
        TRIM(fc.first_name || ' ' || COALESCE(fc.other_name, '')) AS collector_name,
        ft.date_collected,
        'File Store' AS expected_return_location
      FROM folder_transactions ft
      JOIN folder_registration fr ON fr.id = ft.folder_id
      JOIN folder_collectors fc ON ft.collectedby = fc.foco_id
      WHERE ft.date_returned IS NULL 
        AND ft.folder_status = 'Out Store'
      ORDER BY ft.date_collected ASC
    `;

    const result = await pool.query(query);

    if (!result.rows) {
      console.error("Database query returned no rows.");
      return res.status(404).json({ error: "No reminders found" });
    }

    const reminders = result.rows.map((row) => ({
      id: row.folder_id,
      name: row.folder_name,
      collector: row.collector_name,
      collectedDate: row.date_collected,
      returnLocation: row.expected_return_location,
    }));

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error.stack);
    res.status(500).json({ error: "Failed to fetch reminders", details: error.message });
  }
});



app.get('/allcollectedfolders', async (req, res) => {
  try {
    const query = `
      SELECT 
        fc.first_name || ' ' || COALESCE(fc.other_name, '') AS collector_name, 
        fc.phone, 
        COUNT(ft.ft_id) AS folders_collected,
        array_agg(fr.hospital_number || ' - Collected: ' || TO_CHAR(ft.date_collected, 'YYYY-MM-DD')) AS folder_list
      FROM folder_transactions ft
      JOIN folder_registration fr ON fr.id = ft.folder_id
      JOIN folder_collectors fc ON ft.collectedby = fc.foco_id
      WHERE ft.date_returned IS NULL 
        AND ft.folder_status = 'Out Store'
      GROUP BY fc.foco_id, fc.first_name, fc.other_name, fc.phone
    `;

    const result = await pool.query(query);
    const collectedFolders = result.rows;

    if (collectedFolders.length === 0) {
      return res.status(200).json({ message: 'No collected folders found.' });
    }

    // Create an Excel workbook and sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Collected Folders');

    // Define headers
    worksheet.columns = [
      { header: 'Collector Name', key: 'collector_name', width: 25 },
      { header: 'Phone Number', key: 'phone', width: 15 },
      { header: 'Folders Collected', key: 'folders_collected', width: 15 },
      { header: 'Folder List', key: 'folder_list', width: 50 }
    ];

    // Add rows
    collectedFolders.forEach(folder => {
      worksheet.addRow(folder);
    });

    // ✅ Save file in a writable directory (outside `pkg` snapshot)
    const tempDir = os.tmpdir(); // System's temp folder
    const filePath = path.join(tempDir, 'collected_folders.xlsx');

    await workbook.xlsx.writeFile(filePath);

    // ✅ Send the file to the client
    res.download(filePath, 'collected_folders.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ message: 'Error generating Excel file' });
      }

      // ✅ Delete file after download to avoid clutter
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 5000);
    });

  } catch (error) {
    console.error('Error fetching collected folders:', error);
    res.status(500).json({ message: 'Error fetching collected folders', error: error.message });
  }
});


app.get('/purpose', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purpose');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/folderreg', async (req, res) => {
  try {
    const { hospital_number, date_enrollment } = req.body;

    // Check for missing required fields
    if (!hospital_number || !date_enrollment ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the hospital_number already exists
    const existingEntry = await pool.query(
      'SELECT * FROM folder_registration WHERE hospital_number = $1',
      [hospital_number]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(400).json({ error: 'Hospital number already exists' });
    }

    // Insert the new record
    const result = await pool.query(
      'INSERT INTO folder_registration (hospital_number, date_enrollment) VALUES ($1, $2) RETURNING *',
      [hospital_number, date_enrollment]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});



app.patch("/updateStatus", async (req, res) => {
  const { ids, status } = req.body;

  // Validate input
  if (!Array.isArray(ids) || ids.length === 0 || typeof status !== "string") {
    return res.status(400).send({ 
      error: "Invalid input: 'ids' should be a non-empty array, and 'status' should be a string" 
    });
  }

  try {
    const query = `
      UPDATE folder_registration 
      SET status = $1, modification_date = CURRENT_DATE 
      WHERE id = ANY($2)
    `;
    const result = await pool.query(query, [status, ids]);

    res.status(200).send({
      message: "Status updated successfully",
      rowsAffected: result.rowCount,
    });
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).send({ error: "Failed to update status. Please try again later." });
  }
});






app.get('/countfolders', async (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) FILTER (WHERE status IS NOT NULL) AS expected,
      COUNT(*) FILTER (WHERE status = 'Missing') AS missing,
      COUNT(*) FILTER (WHERE status = 'Transfer Out') AS transferred,
      COUNT(*) FILTER (WHERE status = 'Stopped') AS stop,
      COUNT(*) FILTER (WHERE status = 'Dead') AS dead
    FROM folder_registration;
  `;

  try {
    const result = await pool.query(statsQuery); // Corrected to execute the query
    res.status(200).json(result.rows[0]); // Return the first (and only) row with counts
  } catch (error) {
    console.error("Error fetching folder counts:", error.message);
    res.status(500).json({ error: 'Server error occurred while fetching folder counts' });
  }
});



app.get('/getData',async(req,res)=>{
  try {
    const result=await pool.query('SELECT * FROM public.folder_registration');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message)
    res.status(500).json({error:'Server erro'})
  }
});

app.get('/getDataMissing',async(req,res)=>{
  try {
    const status='Missing'
    const result=await pool.query('SELECT * FROM public.folder_registration where status=$1',[status]);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message)
    res.status(500).json({error:'Server erro'})
  }
});

// only avialable folders 
app.get('/folders', async (req, res) => {
  try {
    const query = `
      SELECT 
        fr.*, 
        COALESCE(ft.folder_status, 'In Store') AS folder_status,
        COALESCE(fc.Collector, '') AS collected_by 
    FROM public.folder_registration fr
    LEFT JOIN (
        SELECT DISTINCT ON (folder_id) 
            folder_id, 
            folder_status, 
            collectedby
        FROM public.folder_transactions
        ORDER BY folder_id, date_collected DESC
    ) ft ON fr.id = ft.folder_id
    LEFT JOIN (
        SELECT 
            folder_transactions.folder_id,
            CONCAT(folder_collectors.first_name, ' ', folder_collectors.other_name) AS Collector
        FROM public.folder_transactions 
        JOIN public.folder_collectors 
            ON folder_transactions.collectedby = folder_collectors.foco_id
        WHERE folder_transactions.folder_status = 'Out Store'
    ) fc ON fr.id = fc.folder_id
    WHERE fr.status = 'Available';

    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/regcollector', async (req, res) => {
  try {
    const { first_name, other_name, designation, phone } = req.body;

    // Check for missing required fields
    if (!first_name || !other_name || !designation || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the phone already exists
    const existingEntry = await pool.query(
      'SELECT * FROM folder_collectors WHERE phone = $1',
      [phone]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(400).json({ error: 'Collector already exists!' });
    }

    // Insert the new record
    const result = await pool.query(
      'INSERT INTO folder_collectors (first_name, other_name, designation, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, other_name, designation, phone]
    );

    res.status(201).json({
      message: 'Collector successfully registered!',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error registering collector:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/CogetData", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM folder_collectors");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.patch("/CoUpdateinfo/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, other_name, designation, phone } = req.body;

  try {
    await pool.query(
      "UPDATE folder_collectors SET first_name = $1, other_name = $2, designation=$3, phone = $4 WHERE foco_id = $5",
      [first_name, other_name, designation, phone, id]
    );
    res.status(200).send("Row updated successfully.");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Failed to update data.");
  }
});


app.delete("/CoDeleteCaseManager/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM folder_collectors WHERE foco_id = $1", [id]);

    if (result.rowCount > 0) {
      res.json({ message: "Case manager deleted successfully" });
    } else {
      res.status(404).json({ error: "Case manager not found" });
    }
  } catch (error) {
    console.error("Error deleting case manager:", error);
    res.status(500).json({ error: "Failed to delete case manager" });
  }
});

app.get('/getCollectedFolders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        hospital_number AS FOLDER_ID, 
        date_collected, 
        purpose_name AS Reason, 
        CONCAT(first_name, ' ', other_name) AS Collector, 
        designation, 
        phone
      FROM folder_transactions 
      JOIN folder_registration 
        ON folder_transactions.folder_id = folder_registration.id 
      JOIN folder_collectors 
        ON folder_transactions.collectedby = folder_collectors.foco_id 
      JOIN purpose 
        ON folder_transactions.purpose_id = purpose.purpose_id
      WHERE folder_transactions.folder_status = 'Out Store';
    `);

    // Send the retrieved data as JSON
    res.json(result.rows);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Failed to retrieve data" });
  }
});


// End of ROUTE
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
