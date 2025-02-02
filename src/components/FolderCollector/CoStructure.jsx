import React from 'react'

const CoStructure = (props) => {
  return (
    <>
      <div className="mb-3">
    <label className="form-label">{props.label}</label>
    <input 
        id={props.id}
        type={props.type}
        name={props.name}
        placeholder={props.placeholder}
        value={props.value}
        label={props.label}
        onChange={props.onChange}
        className="form-control" 
        required
    />
     </div>
    </>
  )
}

export default CoStructure
