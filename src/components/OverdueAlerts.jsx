import React from 'react';

const OverdueAlerts = ({ overdueFolders }) => {
  if (!overdueFolders || overdueFolders.length === 0) {
    return null; // Don't render if there are no overdue folders
  }

  return (
    <div className="col-md-12 mb-4">
      <div className="alert alert-warning">
        <strong>Alert!</strong> You have {overdueFolders.length} overdue folder(s):
        <ul>
          {overdueFolders.map((folder, index) => (
            <li key={index}>
              {folder.collector_name} - {folder.overdue_count} folders overdue for {folder.overdue_days} days.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverdueAlerts;