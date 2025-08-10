import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AppsIcon from '@mui/icons-material/Apps';
import ViewListIcon from '@mui/icons-material/ViewList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function Login() {

  const [fileType, setFileType] = React.useState('all');
  const [plotType, setPlotType] = React.useState('all');
  const [view, setView] = React.useState('grid');
  const videoRef = useRef(null);
  
  // Correctly initialize useNavigate at the top level of the component
  const navigate = useNavigate();

  // --- EVENT HANDLERS ---
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handlePlotTypeChange = (event) => {
    const selectedValue = event.target.value;
    
    // If the user selects the special "browse" option, then navigate.
    if (selectedValue === 'browse-all') {
      navigate('/plot-types');
    } else {
      // Otherwise, just update the state like a normal dropdown.
      setPlotType(selectedValue);
    }
  };
  
  // --- SIDE EFFECTS ---
  useEffect(() => {
    // This effect ensures the background video plays automatically
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay was prevented:", error);
      });
    }
  }, []); // Empty dependency array means this runs only once on mount

  // --- RENDER ---
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        overflow: 'hidden', 
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef} 
        autoPlay
        loop
        muted
        playsInline 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        <source src="/websiteVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

 <div className="flex items-center opacity-100 justify-center rounded-3xl bg-[#154a6fa1]">

      <div className="relative opacity-100 z-10 flex flex-col w-full max-w-md gap-8 p-8">

        <div className="flex flex-col justify-center text-center text-white">
          <h1 className="text-5xl font-bold tracking-tight">
            Login!
          </h1>
          <p className="mt-2 text-lg text-gray-100">
            Welcome! Please log in to continue.
          </p>
        </div>

        {/* --- Login Form --- */}
        <div className="flex flex-col justify-center">
          <form className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input 
                type="text" 
                id="username"
                placeholder="Username" 
                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            
            <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input 
                    type="password" 
                    id="password"
                    placeholder="Password" 
                    className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Login
            </button>
            <div className="text-center">
              <p className="text-lg text-white">
                Don't have an account? 
                <a href="/signup" className="text-blue-600 hover:underline"> Sign Up</a>
              </p>
              </div>
          </form>
        </div>
        
      </div>
    </div>
    </Box>
  );
}

export default Login;