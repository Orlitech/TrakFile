import React from 'react'
import img from '../../assets/img/folder-storage-files-organization-document-data-concept.jpg'
const SideImage = () => {
  
    return (
    <>
       
       
              <div className="col-md-6 grid-margin stretch-card">
                <div className="">
                  <div className="card-people mt-auto">
                    <img src={img}alt="people" />
                    <div className="weather-info">
                      <div className="d-flex text-light">
                        <div>
                          <h2 className="mb-0 font-weight-normal"><i className="icon-folder me-2"></i></h2>
                        </div>
                        <div className="ms-2">
                          <h4 className="location font-weight-normal text-light">BOFMIS</h4>
                          <h6 className="font-weight-normal">CodedMide</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
       
        
                            
    </>
  )
}

export default SideImage
