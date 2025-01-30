import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Ensure you have Swal installed (npm install sweetalert2)

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
    { title: "Expected Folders", value: folderStats.expected, icon: "fas fa-folder text-light me-4", cardo:"card card-tale"},
    { title: "Missing Folders", value: folderStats.missing, icon: "fas fa-folder-open text-light me-4", cardo:"card card-light-danger" },
    { title: "Transferred Out", value: folderStats.transferred, icon: "fas fa-exchange-alt me-4 text-light", cardo:"card card-light-danger" },
    { title: "Dead Client", value: folderStats.dead, icon: "fas fa-times-circle  me-4 text-light", cardo:"card card-light-danger" },
    { title: "Client Stopped Treatment", value: folderStats.stop, icon: "fas fa-ban  me-4 text-light", cardo:"card card-light-danger" },
    {
      title: "Folders Available",
      value: folderStats.expected - folderStats.dead - folderStats.transferred - folderStats.missing - folderStats.stop,
      icon: "fas fa-archive  me-4 text-light",cardo:"card card-dark-blue"
    },
  ];

  return (
    <div className="col-md-6 mt-4 grid-margin transparent">
    <div className="row">
      {cardData.map((card, index) => (
        <div className="col-md-6 mb-4 stretch-card transparent" key={index}>
          <div className={card.cardo}>
            <div className="card-body">
              <h5 className="mb-4"><i className={card.icon}></i>{card.title}</h5>
              <h3 className="card-value text-light">{card.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
};

export default DataCards;
