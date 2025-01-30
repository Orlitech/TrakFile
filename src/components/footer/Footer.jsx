import React from "react";
import { Link } from "@chakra-ui/react"; 

const Footer = () => {
  return (
    <footer className="footer bg-body-tertiary" style={{ marginTop: "100px", padding: "20px 0", textAlign: "center" }}>
      <div className="container">
        <span className="text-body-secondary">
          &copy; 2024 CodedMide. All Rights Reserved.
        </span>
        <p style={{ marginTop: "10px", fontSize: "12px" }}>
          Built with ❤️ by <b>CodedMide</b> |{" "}
          
        </p>
      </div>
    </footer>
  );
};

export default Footer;
