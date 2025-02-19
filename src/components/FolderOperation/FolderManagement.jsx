import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./personal_table.css"

const FolderManagement = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [caseManagers, setCaseManagers] = useState([]);
  const [selectedCaseManager, setSelectedCaseManager] = useState("");
  const [purposes, setPurposes] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/folders");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
        setFilteredData(result);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch data. Please try again later.", "error");
      }
    };

    const fetchCaseManagers = async () => {
      try {
        const response = await fetch("http://localhost:5000/CogetData");
        if (!response.ok) {
          throw new Error("Failed to fetch case managers");
        }
        const result = await response.json();
        setCaseManagers(result);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch case managers. Please try again later.", "error");
      }
    };

    const fetchPurposes = async () => {
      try {
        const response = await fetch("http://localhost:5000/purpose");
        if (!response.ok) {
          throw new Error("Failed to fetch purposes");
        }
        const result = await response.json();
        setPurposes(result);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch purposes. Please try again later.", "error");
      }
    };

    fetchData();
    fetchCaseManagers();
    fetchPurposes();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredData(
      data.filter(
        (item) =>
          String(item?.hospital_number || "").toLowerCase().includes(value) ||
          String(item?.folder_status || "").toLowerCase().includes(value) ||
          String(item?.collected_by || "").toLowerCase().includes(value) ||
          String(item?.date_enrollment || "").toLowerCase().includes(value)
      )
    );
    setCurrentPage(1);
  };

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
    console.log("Selected Rows:", selectedRows); // Debugging
  };

  const assignFolders = async () => {
    if (
      selectedRows.length === 0 ||
      !selectedCaseManager ||
      !selectedPurpose ||
      !selectedDate
    ) {
      Swal.fire("Warning", "Please select rows, a case manager, a purpose, and a date.", "warning");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/assign', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: selectedRows,
          purpose_id: selectedPurpose,
          collectedby: selectedCaseManager,
          date_collected: selectedDate,
        }),
      });
      if (!response.ok) throw new Error("Failed to assign folders");

      Swal.fire("Success", "Folders assigned successfully.", "success");
      setSelectedRows([]);
      setSelectedCaseManager("");
      setSelectedPurpose("");
      setSelectedDate("");
    } catch (error) {
      Swal.fire("Error", "Failed to assign folders. Please try again.", "error");
    }
  };

  const markAsReturned = async () => {
    if (selectedRows.length === 0 || !selectedDate) {
      Swal.fire("Warning", "Please select rows and a date.", "warning");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/return-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ftId: selectedRows,
          returnDate: selectedDate,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to return folders");
      }
  
      Swal.fire("Success", "Folders returned successfully.", "success");
      setSelectedRows([]);
      setSelectedDate("");
    } catch (error) {
      console.error("Error returning folders:", error);
      Swal.fire("Error", error.message || "Failed to return folders. Please try again.", "error");
    }
  };
  
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function downloadOverdueFolders() {
    fetch("http://localhost:5000/overdue-folders", {
        method: "GET",
        headers: {
            "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to download file");
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "overdue_folders.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error("Error downloading file:", error));
}

function allcollectedfolders() {
    fetch("http://localhost:5000/allcollectedfolders", {
        method: "GET",
        headers: {
            "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to download file");
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Collected_folders.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error("Error downloading file:", error));
}

  return (
    <div className="container mt-4">
      <div className="card">
      <div className="card-body">
      <h4 className="text-center mb-4">Folder Operation</h4>
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Hospital Number"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select form-control"
            value={selectedCaseManager}
            onChange={(e) => setSelectedCaseManager(e.target.value)}
          >
            <option value="">Select Case Manager</option>
            {caseManagers.map((manager) => (
              <option key={manager.foco_id} value={manager.foco_id}>
                {manager.first_name + " " + manager.other_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select form-control"
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
          >
            <option value="">Select Purpose</option>
            {purposes.map((purpose) => (
              <option key={purpose.purpose_id} value={purpose.purpose_id}>
                {purpose.purpose_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12 d-flex justify-content-start">
          <button className="btn btn-primary me-3" onClick={assignFolders}>
            Assign to Case Manager
          </button>
          <button className="btn btn-success me-3" onClick={markAsReturned}>
            Mark as Returned
          </button>
          <button className="btn btn-secondary me-3" onClick={downloadOverdueFolders}>
            Over due Folders
          </button>
          <button className="btn btn-warning me-3" onClick={allcollectedfolders}>
            Collected Folders
          </button>
        </div>
      </div>

      <table className="personal_table table-striped table-bordered table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Select</th>
            <th>Hospital Number</th>
            <th>Date Enrollment</th>
            <th>Status</th>
            <th>Collected By</th>
          </tr>
        </thead>
        <tbody>
  {displayedData.length > 0 ? (
    displayedData.map((item) => {
      const isOutStore = item.folder_status === "Out Store";
      return (
        <tr key={item.id} className={isOutStore ? "out-store-row" : ""}>
          <td>
            <input
              type="checkbox"
              checked={selectedRows.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
            />
          </td>
          <td>{item.hospital_number}</td>
          <td>{item.date_enrollment}</td>
          <td>{item.folder_status || "Not Set"}</td>
          <td>{isOutStore ? item.collected_by : ""}</td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="5" className="text-center">No matching records found</td>
    </tr>
  )}
</tbody>

      </table>
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default FolderManagement;