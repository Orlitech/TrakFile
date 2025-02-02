
import React from 'react';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/all.min.css";
import './assets/vendors/feather/feather.css';
import './assets/vendors/ti-icons/css/themify-icons.css';
import './assets/vendors/css/vendor.bundle.base.css'
import './assets/vendors/font-awesome/css/font-awesome.min.css'
import './assets/vendors/mdi/css/materialdesignicons.min.css'
import './assets/vendors/css/vendor.bundle.base.css'
import './assets/js/select.dataTables.min.css'
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/footer';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './components/views/dashboard';
import {  Routes, Route, Navigate } from 'react-router-dom';
import FoReg from './components/views/FoReg';
import FoOp from './components/views/FoOp';
import FoMissing from './components/views/FoMissing';

function App() {
  

  return (
 
    <div className='container-fluid'>
    <Navbar />
    <div className='container-fluid page-body-wrapper'>
        
        <Sidebar />
        
        <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} /> 
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/RegFolder" element={<FoReg/>} />
                 <Route path="/FoOP" element={<FoOp />} />
                <Route path="/FoMissing" element={<FoMissing />} />
               {/* <Route path="/Management" element={<Management/>} />
                <Route path="*" element={<Error404 />} /> */}
          </Routes>  
    </div>
    <Footer />
    </div>
   
  )
}

export default App
