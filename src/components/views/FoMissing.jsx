import React from 'react'
import CarouselCard from '../cards/CarouselCard'
import FolderMissing from '../FolderMissing/FolderMissing'

const FoMissing = () => {
  return (
    <>
      <div className="main-panel">
        <div className="content-wrapper">
    <div className="row">
    <CarouselCard />
    <FolderMissing />
    </div>
    </div>
    </div>
    </>
  )
}

export default FoMissing
