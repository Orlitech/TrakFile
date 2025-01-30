import { useState } from "react";

const useFormsControl = () => {
  const [hospital_number, setHospitalNumber] = useState("");
  const [date_enrollment, setDateEnrollment] = useState("");

  const formsControl = [
    {
      id: 1,
      name: "hospital_number",
      label: "Client Folder ID",
      type: "text",
      placeholder: "Enter the Hospital No",
      value: hospital_number,
      onChange: (e) => setHospitalNumber(e.target.value),
    },
    {
      id: 2,
      name: "date_enrollment",
      label: "Registration Date",
      type: "date",
      placeholder: "Enter the ART Start Date",
      value: date_enrollment,
      onChange: (e) => setDateEnrollment(e.target.value),
    },
 
  ];

  return formsControl;
};

export default useFormsControl;
