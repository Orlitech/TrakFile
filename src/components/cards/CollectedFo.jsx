import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns"

const CollectedFo = () => {
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
        const response = await fetch("http://localhost:5000/getCollectedFolders");
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
          String(item?.folder_id || "").toLowerCase().includes(value) ||
          String(item?.collector || "").toLowerCase().includes(value) ||
          String(item?.designation || "").toLowerCase().includes(value)
      )
    );
    setCurrentPage(1); // Reset to first page on search
  };

 
  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Collected Folder(s)</h5>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Hospital Number or Status"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="table-responsive">
            <table className="display expandable-table" style={{width:'100%'}}>
              <thead>
                <tr>
                  <th>Hospital Number</th>
                  <th>Date Collected</th>
                  <th>Reason For Collection</th>
                  <th>Collector</th>
                  <th>Designation</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {displayedData.length > 0 ? (
                  displayedData.map((item) => (
                    <tr key={item.id}>
                     
                      <td>{item.folder_id}</td>
                      <td>{format(new Date(item.date_collected), "yyyy-MM-dd")}</td>
                      <td>{item.reason}</td>
                      <td>{item.collector}</td>
                      <td>{item.designation}</td>
                      <td>{item.phone}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-primary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="btn btn-primary"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
          <div className="mt-4">
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectedFo;
