import React from 'react'
import CarouselCard from '../cards/CarouselCard'
import FolderManagement from '../FolderOperation/FolderManagement'
import StorageRecommendations from '../StorageRecommendations'

const FoOp = () => {
  return (
    <>
      <div className="main-panel">
        <div className="content-wrapper">
            <div className="row">
                 <CarouselCard />
                 <StorageRecommendations/>
                 <FolderManagement />
            </div>
        </div>
    </div>
    </>
  )
}

export default FoOp
