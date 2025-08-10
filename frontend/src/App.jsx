import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Home from '../components/Home.jsx';
import PlotTypes from '../components/PlotTypes.jsx';
import { Box } from '@mui/material';
import Login from '../pages/Login.jsx';
import SignUp from '../pages/SignUp.jsx';

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Navbar />
        <Routes>
          {/* Route for the home page */}
          <Route path="/" element={<Home />} />
          <Route path="/plot-types" element={<PlotTypes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
