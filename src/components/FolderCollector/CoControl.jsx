import React, {useState} from 'react'



const useFormsControl = () => {
const [Firstname, setFirstname]= useState("");
const [Othernames, setOthernames]= useState("");
const [Phone, setPhone]= useState("");
const [Designation, setDesignation]= useState("");
const ListForm = [

    {
        id: 1,
        name: "first_name",
        label: "First Name",
        type: "text",
        placeholder: "Enter the Firstname",
        value: Firstname,
        onChange: (e) => setFirstname(e.target.value),
    },
    {
        id: 2,
        name: "other_name",
        label: "Other Names",
        type: "text",
        placeholder: "Enter other names",
        value: Othernames,
        onChange: (e) => setOthernames(e.target.value),
    },
    {
        id: 3,
        name: "designation",
        label: "Designation",
        type: "text",
        placeholder: "Enter the Designation",
        value: Designation,
        onChange: (e) => setDesignation(e.target.value),
    },
    {
        id: 4,
        name: "phone",
        label: "Phone Number",
        type: "text",
        placeholder: "Enter the Phone number",
        value: Phone,
        onChange: (e) => setPhone(e.target.value),
    },
]


return ListForm
}
export default useFormsControl;