import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from '../../assets/img/logo.png';
import usericon from '../../assets/img/user.png';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Navbar = () => {
  const [count, setCount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/overdue-folders/count");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setCount(result.overdue_count);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch data. Please try again later.", "error");
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row shadow-sm">
        {/* Logo Section */}
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start">
          <a className="navbar-brand brand-logo" href="/">
            <img src={logo} className="ms-2" alt="BOFMIS Logo" />
          </a>
          <a className="navbar-brand brand-logo-mini" href="/">
            <img src={logo} alt="Mini Logo" />
          </a>
          <h4 className="title mt-3" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#2c3e50' }}>
            BOFMIS
          </h4>
        </div>

        {/* Navbar Menu */}
        <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
          {/* Minimize Button */}
          <button
            className="navbar-toggler navbar-toggler align-self-center"
            type="button"
            data-bs-toggle="minimize"
          >
            <span className="icon-menu"></span>
          </button>

          {/* Search Bar */}
          <ul className="navbar-nav mr-lg-2">
            <li className="nav-item nav-search d-none d-lg-block">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="navbar-search-input"
                  placeholder="Search now"
                  aria-label="search"
                  aria-describedby="search"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  id="navbar-search-icon"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </li>
          </ul>

          {/* Right Side Menu */}
          <ul className="navbar-nav navbar-nav-right">
            {/* Notifications */}
            <li className="nav-item dropdown">
              <a
                className="nav-link count-indicator dropdown-toggle"
                id="notificationDropdown"
                href="#"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-bell mx-0"></i>
                {count > 0 && <span className="count bg-danger text-light">{count}</span>}
              </a>
              <div
                className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
                aria-labelledby="notificationDropdown"
              >
                <p className="mb-0 font-weight-normal dropdown-header">
                  Notifications
                </p>
                <Link className="dropdown-item preview-item" to="/FoOP">
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-success">
                      <i className="fas fa-info-circle mx-0 text-white"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <h6 className="preview-subject font-weight-normal">
                      {count} Overdue Folders
                    </h6>
                    <p className="font-weight-light small-text mb-0 text-muted">
                      Just now
                    </p>
                  </div>
                </Link>
              </div>
            </li>

            {/* User Profile */}
            <li className="nav-item nav-profile dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
                id="profileDropdown"
              >
                <img src={usericon} alt="User Profile" className="rounded-circle" style={{ width: '40px', height: '40px' }} />
              </a>
              <div
                className="dropdown-menu dropdown-menu-right navbar-dropdown"
                aria-labelledby="profileDropdown"
              >
                <a className="dropdown-item" href="#">
                  <i className="fas fa-user text-primary me-2"></i> Profile
                </a>
                <a className="dropdown-item" href="#">
                  <i className="fas fa-power-off text-danger me-2"></i> Logout
                </a>
              </div>
            </li>

            {/* Settings */}
            <li className="nav-item nav-settings d-none d-lg-flex">
              <a className="nav-link" href="#">
                <i className="fas fa-cog"></i>
              </a>
            </li>
          </ul>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
            type="button"
            data-bs-toggle="offcanvas"
          >
            <span className="icon-menu"></span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;