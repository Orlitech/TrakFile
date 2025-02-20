import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Ensure you have Swal installed (npm install sweetalert2)
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const DataCards = () => {
  const [folderStats, setFolderStats] = useState({
    expected: 0,
    missing: 0,
    transferred: 0,
    dead: 0,
    stop: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/countfolders");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setFolderStats(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data. Please try again later.", "error");
      }
    };

    fetchData();
  }, []);

  const cardData = [
    { title: "Expected Folders", value: folderStats.expected, icon: "fas fa-folder fa-2x text-primary me-4" },
    { title: "Missing Folders", value: folderStats.missing, icon: "fas fa-folder-open fa-2x text-danger me-4" },
    { title: "Transferred Out", value: folderStats.transferred, icon: "fas fa-exchange-alt fa-2x text-warning me-4" },
    { title: "Dead Client", value: folderStats.dead, icon: "fas fa-times-circle fa-2x text-danger me-4" },
    { title: "Client Stopped Treatment", value: folderStats.stop, icon: "fas fa-ban fa-2x text-secondary me-4" },
    {
      title: "Folders Available",
      value: folderStats.expected - folderStats.dead - folderStats.transferred - folderStats.missing - folderStats.stop,
      icon: "fas fa-archive fa-2x text-success me-4",
    },
  ];

  return (
    <div className="col-md-8 mt-2 grid-margin">
      <div className="row">
        {cardData.map((card, index) => (
          <div className="col-md-4 mb-2 stretch-card" key={index}>
            <div
              className="card h-100 shadow-sm"
              style={{
                borderRadius: "15px",
                border: "none",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className={card.icon} style={{ marginBottom: "15px" }}></i>
                <h5 className="card-title mb-2" style={{ fontSize: "1.0rem", fontWeight: "600" }}>
                  {card.title}
                </h5>
                <h2 className="card-value" style={{ color: "#2c3e50", fontSize: "2rem", fontWeight: "700" }}>
                  {card.value}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataCards;