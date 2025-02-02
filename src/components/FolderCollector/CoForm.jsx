import React from 'react';
import CoStructure from './CoStructure';
import useFormsControl from './CoControl';
import Swal from 'sweetalert2';
import img from '../../assets/img/regs.jpg';

const CoForm = () => {
  const ListForm = useFormsControl();

  function createForms(createForm) {
    return (
      <CoStructure
        key={createForm.id}
        id={createForm.id}
        name={createForm.name}
        type={createForm.type}
        label={createForm.label}
        placeholder={createForm.placeholder}
        value={createForm.value}
        onChange={createForm.onChange}
      />
    );
  }

  const regSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      const response = await fetch('http://localhost:5000/regcollector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        if (errorResponse.error === 'Code already exists') {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Code',
            text: 'The code you entered already exists. Please use a different code.',
          });
          return;
        }
        throw new Error(errorResponse.error || 'Request failed');
      }

      const result = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your registration was successful!',
      });
      console.log('Success:', result);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred during registration.',
      });
    }
  };

  return (
    <div className="container  mt-4">
      <div className="card">
      <div className="card-body">
      <div className="row align-items-center">
        {/* Form Column */}
        <div className="col-md-6">
          <form onSubmit={regSubmit}>
            <h4 className="mb-4">Folder Collector Registration</h4>
            {ListForm.map(createForms)}
            <div className="mt-3">
              <input
                type="submit"
                value="Register"
                className="btn btn-secondary"
                name="register"
              />
            </div>
          </form>
        </div>

        {/* Image Column */}
        <div className="col-md-6 text-center">
          <img
            src={img}
            className="img-fluid rounded"
            alt="Bootstrap Themes"
            width="500"
            height="200"
          />
        </div>
      </div>
    </div>
    </div>
    </div>
    
  );
};

export default CoForm;
