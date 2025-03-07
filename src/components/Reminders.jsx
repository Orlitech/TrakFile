import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./ReminderCss.css";

const Reminders = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Controls visibility of the notification

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch("http://localhost:5000/reminders");
        if (!response.ok) {
          throw new Error("Failed to fetch reminders");
        }
        const data = await response.json();
        setFolders(data);
        if (data.length > 0) {
          setIsVisible(true); // Show notification if there's data
        }
      } catch (error) {
        setError(error.message);
        Swal.fire("Error", "Failed to fetch reminders. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Hide the notification
  };

  if (loading) {
    return <div>Loading reminders...</div>;
  }

  if (error) {
    return <div className="text-danger">Error: {error}</div>;
  }

  // Only show the notification if there are folders and it's visible
  if (folders.length === 0 || !isVisible) {
    return null;
  }

  // Limit display to 5 if not showing all
  const displayedFolders = showAll ? folders : folders.slice(0, 5);

  return (
    <div className="reminder-notification-container mt-5">
      <div className="reminder-notification">
        <div className="notification-header">
          <strong>Reminders <i className="fa fa-bell"></i></strong>
          <span className="notification-close" onClick={handleClose}>
            &times;
          </span>
        </div>
        <div className="notification-body">
          <p>The following folders should be returned to the Folder Storage. Contact the collectors if unavailable.</p>
          <div className="folder-list">
            {displayedFolders.map((folder) => (
              <div key={folder.id} className="folder-item">
                <span className="folder-name">{folder.name}</span>
              </div>
            ))}
          </div>
          {folders.length > 5 && (
            <button className="view-all-button" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : "View All"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;