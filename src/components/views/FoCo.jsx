import React from 'react'
import CarouselCard from '../cards/CarouselCard'
import CoForm from '../FolderCollector/CoForm'
import CoDataTable from '../FolderCollector/CoDataTable'
const FoCo = () => {
  return (
    <>
     <div className="main-panel">
        <div className="content-wrapper">
    <div className="row">
    <CarouselCard />
   <CoForm />
   <CoDataTable />
    </div>
    </div>
    </div>
      
    </>
  )
}

export default FoCo
