import React from 'react';
import img from '../../assets/img/folder-storage-files-organization-document-data-concept.jpg';
import './SideImage.css'; // Import the CSS file for animations and styling

const SideImage = () => {
  return (
    <div className="col-md-4 mt-2 grid-margin stretch-card h-100">
      <div className="card-people mt-auto">
        <div className="image-container">
          <img src={img} alt="people" className="animated-image" />
        </div>
        <div className="weather-info">
          <div className="d-flex text-light">
            <div>
              <h2 className="mb-0 font-weight-normal">
                <i className="icon-folder me-2"></i>
              </h2>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideImage;