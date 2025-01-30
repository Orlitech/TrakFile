import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SidebarStructure from "./SiderbarStructure";
import SideRoutes from "./SideRoutes"; 

const Sidebar = () => {

  const constructor =(side) =>{
    return (
    <SidebarStructure 
            key={side.id}  
            icon={side.icon} 
            name={side.label} 
            link={side.link}
          />
    );
  };
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        {SideRoutes.map(constructor)}
      </ul>
    </nav>
  );
};

export default Sidebar;
