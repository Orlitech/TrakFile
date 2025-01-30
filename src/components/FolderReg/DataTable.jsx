import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns"
const DataTable = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch data from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/getData");
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
    fetchData();
  }, []);

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredData(
      data.filter(
        (item) =>
          String(item?.hospital_number || "").toLowerCase().includes(value) ||
          String(item?.status|| "").toLowerCase().includes(value) ||
          String(item?.date_enrollment || "").toLowerCase().includes(value)
      )
    );
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Bulk update status
  const bulkUpdateStatus = async (status) => {
    if (selectedRows.length === 0) {
      Swal.fire("Warning", "No rows selected for update.", "warning");
      return;
    }

    try {
      // Update status in the backend for selected rows
      const response = await fetch(`http://localhost:5000/updateStatus`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows, status }),
      });
      if (!response.ok) throw new Error("Failed to update status");

      // Update status in the table
      setData((prevData) =>
        prevData.map((item) =>
          selectedRows.includes(item.id) ? { ...item, status } : item
        )
      );
      setFilteredData((prevFiltered) =>
        prevFiltered.map((item) =>
          selectedRows.includes(item.id) ? { ...item, status } : item
        )
      );

      Swal.fire("Success", `Status updated to ${status} for selected rows.`, "success");
      setSelectedRows([]); // Clear selection
    } catch (error) {
      Swal.fire("Error", "Failed to update status. Please try again.", "error");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="container mt-2">
      <div class="card">
      <div class="card-body">
      <h6 className="card-title">Folders Registered</h6>
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Hospital Number"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col-md-6 d-flex justify-content-end">
          <button
            className="btn btn-success btn-sm me-1"
            onClick={() => bulkUpdateStatus("Available")}
          >
            Mark as Available
          </button>
          <button
            className="btn btn-warning btn-sm me-1"
            onClick={() => bulkUpdateStatus("Missing")}
          >
            Mark as Missing
          </button>
          <button
            className="btn btn-danger btn-sm me-1"
            onClick={() => bulkUpdateStatus("Dead")}
          >
            Mark as Dead
          </button>
          <button
            className="btn btn-secondary btn-sm me-1"
            onClick={() => bulkUpdateStatus("Transfer Out")}
          >
            Mark as Transfer Out
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => bulkUpdateStatus("Stopped")}
          >
            Mark as Stopped
          </button>
        </div>
      </div>
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Select</th>
            <th>Hospital Number</th>
            <th>Date Enrollment</th>
            <th>Status</th>
            <th>Date of Current Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.length > 0 ? (
            displayedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                </td>
                <td>{item.hospital_number}</td>
                <td>{item.date_enrollment}</td>
                <td>{item.status || "Not Set"}</td>
                <td>{format(new Date(item.modification_date), "yyyy-MM-dd")|| "Not Set"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No matching records found
              </td>
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

export default DataTable;
