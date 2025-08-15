import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Home from '../components/Home.jsx';
import PlotTypes from '../components/PlotTypes.jsx';
import { Box } from '@mui/material';
import Login from '../pages/Login.jsx';
import SignUp from '../pages/SignUp.jsx';
import ChartDisplay from '../components/ChartsDisplay.jsx'; // Import the ChartDisplay component
import { AuthProvider } from '../src/context/AuthContext.jsx'; // Import the AuthProvider

function App() {
  return (
    // The AuthProvider now wraps your entire application
    <AuthProvider>
      <BrowserRouter>
        <Box>
          <Navbar />
          <Routes>
            {/* Your routes remain unchanged */}
            <Route path="/" element={<Home />} />
            <Route path="/plot-types" element={<PlotTypes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
          <ChartDisplay /> {/* Add the ChartDisplay component here */}
        </Box>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;