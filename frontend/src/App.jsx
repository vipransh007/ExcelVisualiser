import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Home from '../components/Home.jsx';
import PlotTypes from '../components/PlotTypes.jsx';
import { Box } from '@mui/material';

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Navbar />
        <Routes>
          {/* Route for the home page */}
          <Route path="/" element={<Home />} />
          
          {/* Route for the plot types page */}
          <Route path="/plot-types" element={<PlotTypes />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
