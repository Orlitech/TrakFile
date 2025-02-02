import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const CoDataTable = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch data from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/CogetData");
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
          String(item?.first_name || "").toLowerCase().includes(value) ||
          String(item?.other_name || "").toLowerCase().includes(value) ||
          String(item?.designation || "").toLowerCase().includes(value) ||
          String(item?.phone || "").toLowerCase().includes(value)
      )
    );
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle change in input fields
  const handleInputChange = (e, id, field) => {
    const { value } = e.target;
    setFilteredData((prev) =>
      prev.map((row) => (row.foco_id === id ? { ...row, [field]: value } : row))
    );
  };

  // Handle update row
  const handleUpdateRow = async (id) => {
    const updatedRow = filteredData.find((row) => row.foco_id === id);

    try {
      const response = await fetch(`http://localhost:5000/CoUpdateinfo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRow),
      });

      if (!response.ok) throw new Error("Failed to update data");

      Swal.fire("Success", "Row updated successfully.", "success");
      setData((prev) =>
        prev.map((row) => (row.foco_id === id ? { ...updatedRow } : row))
      );
    } catch (error) {
      Swal.fire("Error", "Failed to update data. Please try again.", "error");
    }
  };



  // Handle delete case manager
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/CoDeleteCaseManager/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete case manager");
        }

        Swal.fire("Deleted!", "Case manager has been deleted.", "success");

        // Remove the deleted case manager from the table
        setData((prevData) => prevData.filter((item) => item.foco_id !== id));
        setFilteredData((prevFiltered) =>
          prevFiltered.filter((item) => item.foco_id !== id)
        );
      } catch (error) {
        Swal.fire("Error", "Failed to delete case manager. Please try again.", "error");
      }
    }
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
      <h5 className="text-center mb-4">Registered Folder Collectors</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name or Phone"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      <table className="table table-striped table-hover ">
        <thead className="thead-dark">
          <tr>
            <th>First Name</th>
            <th>Other Name</th>
            <th>Designation</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.length > 0 ? (
            displayedData.map((item) => (
              <tr key={item.foco_id}>
                <td>
                  <input
                    type="text"
                    value={item.first_name || ""}
                    onChange={(e) => handleInputChange(e, item.foco_id, "first_name")}
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.other_name || ""}
                    onChange={(e) => handleInputChange(e, item.foco_id, "other_name")}
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.designation || ""}
                    onChange={(e) => handleInputChange(e, item.foco_id, "designation")}
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.phone || ""}
                    onChange={(e) => handleInputChange(e, item.foco_id, "phone")}
                    className="form-control"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUpdateRow(item.foco_id)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() => handleDelete(item.foco_id)}
                  >
                    Delete
                  </button>
                </td>
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

export default CoDataTable;
