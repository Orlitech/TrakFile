
import React from 'react'
import CarouselCard from '../cards/CarouselCard'
import RegForm from '../FolderReg/RegForm'
import DataTable from '../FolderReg/DataTable'

const FoReg = () => {
  return (
    <div className="main-panel">
        <div className="content-wrapper">
    <div className="row">
    <CarouselCard />
    <RegForm />
    <DataTable />
    </div>
    </div>
    </div>
  )
}

export default FoReg
