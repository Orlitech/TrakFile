import React from 'react';
import { Link } from 'react-router-dom';

const SidebarStructure = (props) => {
  return (
    <li className="nav-item">
      <Link className="nav-link" to={props.link}>
        <i className={props.icon}></i>
        <span className="menu-title">{props.name}</span>
      </Link>
    </li>
  );
};

export default SidebarStructure;
