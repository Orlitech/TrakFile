import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const ProgressBar = ({ label, value, progressClass }) => (
  <tr>
    <td className="text-muted">{label}</td>
    <td className="w-100 px-0">
      <div className="progress progress-md mx-4">
        <div
          className={`progress-bar ${progressClass}`}
          role="progressbar"
          style={{ width: `${value || 0}%` }}
          aria-valuenow={value || 0}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </td>
    <td>
      <h5 className="font-weight-bold mb-0">{value || 0}%</h5>
    </td>
  </tr>
);

const CarouselCard = () => {
  const [folderStats, setFolderStats] = useState({
    expected: 1, // Prevent division by zero, set a default value
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

  // Calculate percentages
  const { expected, missing, transferred, dead, stop } = folderStats;
  const progressData = [
    { label: "Missing Folders", value: ((missing / expected) * 100).toFixed(2), progressClass: "bg-danger" },
    { label: "Transferred Clients", value: ((transferred / expected) * 100).toFixed(2), progressClass: "bg-success" },
    { label: "Deceased Clients", value: ((dead / expected) * 100).toFixed(2), progressClass: "bg-warning" },
    { label: "Stopped Clients", value: ((stop / expected) * 100).toFixed(2), progressClass: "bg-primary" },
  ];

  return (
    <div className="card position-relative">
      <div className="card-body">
        <div
          id="detailedReports"
          className="carousel slide detailed-report-carousel position-static pt-2"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <div className="row">
                <div className="col-md-12 col-xl-3 d-flex flex-column justify-content-start">
                  <div className="ml-xl-4 mt-3">
                    <p className="card-title">Detailed Reports</p>
                    <h1 className="text-primary">{expected}</h1>
                    <h3 className="font-weight-500 mb-xl-4 text-primary">Expected Folders</h3>
                    <p className="mb-2 mb-xl-0">
                      The total number of folders expected within the given period. Below are
                      the statistics calculated based on this number.
                    </p>
                  </div>
                </div>

                <div className="col-md-12 col-xl-9">
                  <div className="row">
                    <div className="col-md-6 border-right">
                      <div className="table-responsive mb-3 mb-md-0 mt-3">
                        <table className="table table-borderless report-table">
                          <tbody>
                            {progressData.map((data, index) => (
                              <ProgressBar
                                key={index}
                                label={data.label}
                                value={data.value}
                                progressClass={data.progressClass}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="col-md-6 mt-3">
                      <div className="doughnutchart-wrapper">
                        <canvas id="north-america-chart"></canvas>
                      </div>
                      <div id="north-america-chart-legend"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Additional carousel-item can go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
