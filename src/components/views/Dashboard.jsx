import React, { useEffect, useState } from 'react';
import img from "../../assets/img/folder.jpg"
import SideImage from '../cards/SideImage';
import DataCards from '../cards/DataCards';
import CarouselCard from '../cards/CarouselCard';
import CollectedFo from '../cards/CollectedFo';
import OverdueAlerts from '../OverdueAlerts';
import Reminders from '../Reminders';
import StorageRecommendations from '../StorageRecommendations';


const Dashboard = () => {
  const [Count, setCount] = useState(""); // Declare the state inside the component
  const [overdueFolders, setOverdueFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch overdue count
        const countResponse = await fetch("http://localhost:5000/overdue-folders/count");
        if (!countResponse.ok) {
          throw new Error("Failed to fetch overdue count");
        }
        const countData = await countResponse.json();
        setCount(countData.overdue_count);



        // Fetch overdue folders data for display (if needed)
        const foldersDataResponse = await fetch("http://localhost:5000/overdue-folders/data"); // Add this endpoint in your backend
        if (!foldersDataResponse.ok) {
          throw new Error("Failed to fetch overdue folders data");
        }
        const foldersData = await foldersDataResponse.json();
        setOverdueFolders(foldersData);
      } catch (error) {
        setError(error.message);
        Swal.fire("Error", "Failed to fetch data. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    return formattedDate;
  };

  return (
    <>
      <div className="main-panel">
        <div className="content-wrapper">
          <div className="row">
            <div className="col-md-12 grid-margin">
              <div className="row">
                <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                  <h3 className="font-weight-bold">Welcome User</h3>
                  <h6 className="font-weight-normal mb-0">
                    All systems are running smoothly! You have{' '}
                    <span className="text-primary">{Count} Overdue Folder alerts!</span>
                  </h6>
                </div>
                <div className="col-12 col-xl-4">
                  <div className="justify-content-end d-flex">
                    <div className="dropdown flex-md-grow-1 flex-xl-grow-0">
                      <button
                        className="btn btn-sm btn-light bg-white dropdown-toggle"
                        type="button"
                        id="dropdownMenuDate2"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="true"
                      >
                        <i className="mdi mdi-calendar"></i> Today ({CurrentDate()}){/* Call the function here */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* New Components */}
        <OverdueAlerts overdueFolders={overdueFolders} />
        <Reminders />
        

          <div className="row">

              <SideImage />
              <DataCards />
              <CarouselCard />
              <StorageRecommendations />
              <CollectedFo />
          </div>
                   
        </div>
      </div>
    </>
  );
};

export default Dashboard;
