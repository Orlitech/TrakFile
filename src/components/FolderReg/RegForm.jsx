import React from 'react'
import RegStructure from './RegStructure'
import useFormsControl from "./formsControl"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from "sweetalert2";

const RegForm = () => {
     const formsControl = useFormsControl(); 
    const constructForm=(createForm)=>{
        return(
            <RegStructure
            key={createForm.id}
            id={createForm.id}
            name={createForm.name}
            type={createForm.type}
            label={createForm.label}
            placeholder={createForm.placeholder}
            value={createForm.value}
            onChange={createForm.onChange}
            
            
            />
        )
    }

    const regSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
    
        const formData = new FormData(e.target); // Get form data
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value; // Convert FormData to an object
        });
    
        console.log("Data being sent:", data); // Debug log
    
        try {
            const response = await fetch("http://localhost:5000/folderreg", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data), // Send data as JSON
            });
    
            if (!response.ok) {
                const errorResponse = await response.json(); // Parse the error response
                console.error("Server Error:", errorResponse);
                
                // Handle duplicate code error
                if (errorResponse.error === 'Code already exists') {
                    Swal.fire({
                        icon: "error",
                        title: "Duplicate Code",
                        text: "The code you entered already exists. Please use a different code.",
                    });
                    return;
                }
    
                throw new Error(errorResponse.error || "Request failed");
            }
    
            const result = await response.json();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Your registration was successful!",
            });
            console.log("Success:", result);
        } catch (error) {
            console.error("Error:", error.message);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "An error occurred during registration.",
            });
        }
    };
    
  return (
    <div>
      <div className="col-12 grid-margin stretch-card mt-3">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">Folder Registration</h4>
                    <p className="card-description"> Hello User, please ensure that all data for this client folder is accurately and comprehensively captured. This information is crucial for ensuring seamless and efficient processes while utilizing the application. Properly recorded data enhances operational effectiveness, minimizes errors, and supports informed decision-making, ultimately enabling better outcomes for all stakeholders involved. </p>
                    <form className="form-inline" onSubmit={regSubmit}>
                      {formsControl.map(constructForm)}
                                           
                      <button type="submit" name='register' 
                      className="btn btn-primary mb-2">Submit</button>
                      
                    </form>
                  </div>
                </div>
              </div>
    </div>
  )
}

export default RegForm
