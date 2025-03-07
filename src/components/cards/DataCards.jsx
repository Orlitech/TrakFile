import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import './DataCards.css'

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
    { title: "Expected Folders", value: folderStats.expected, icon: "fas fa-folder fa-2x text-primary" },
    { title: "Missing Folders", value: folderStats.missing, icon: "fas fa-folder-open fa-2x text-danger" },
    { title: "Transferred Out", value: folderStats.transferred, icon: "fas fa-exchange-alt fa-2x text-warning" },
    { title: "Dead Client", value: folderStats.dead, icon: "fas fa-times-circle fa-2x text-danger" },
    { title: "Client Stopped Treatment", value: folderStats.stop, icon: "fas fa-ban fa-2x text-secondary" },
    {
      title: "Folders Available",
      value: folderStats.expected - folderStats.dead - folderStats.transferred - folderStats.missing - folderStats.stop,
      icon: "fas fa-archive fa-2x text-success",
    },
  ];

  return (
    <div className="col-md-8 mt-4 grid-margin">
      <div className="row">
        {cardData.map((card, index) => (
          <div className="col-md-4 mb-2" key={index}>
            <div className="folder-card">
              <div className="folder-tab"></div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className={card.icon} style={{ marginBottom: "10px" }}></i>
                <h6 className="card-title mb-2">{card.title}</h6>
                <h2 className="card-value">{card.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataCards;
