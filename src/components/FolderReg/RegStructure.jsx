import React from 'react'

const RegStructure = (props) => {
  return (
    <div>
      <label className="sr-only" for="inlineFormInputName2">{props.name}</label>
      <input 
      type={props.type}
      name={props.name}
      className="form-control mb-2 mr-sm-2" id="inlineFormInputName2" 
      placeholder={props.placeholder} 
      value={props.value}
      onChange={props.onChange}
      id={props.id}
      
      />
                      
    </div>
  )
}

export default RegStructure
