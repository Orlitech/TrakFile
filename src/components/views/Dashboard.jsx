import React, { useEffect, useState } from 'react';
import img from "../../assets/img/folder.jpg"
import SideImage from '../cards/SideImage';
import DataCards from '../cards/DataCards';
import CarouselCard from '../cards/CarouselCard';
import CollectedFo from '../cards/CollectedFo';

const Dashboard = () => {
  const [Count, setCount] = useState(""); // Declare the state inside the component

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/overdue-folders/count");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setCount(result.overdue_count); // Set only the overdue_count value from the response
      } catch (error) {
        Swal.fire("Error", "Failed to fetch data. Please try again later.", "error");
      }
    };

    fetchData(); // Call fetchData on mount

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


          <div className="row">

              <SideImage />
              <DataCards />
              <CarouselCard />
              <CollectedFo />
          </div>
                   
        </div>
      </div>
    </>
  );
};

export default Dashboard;
