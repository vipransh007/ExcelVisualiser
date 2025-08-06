import React, { useEffect, useRef } from 'react';
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
import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import PlotTypes from './PlotTypes';

// The main Home component using Material-UI
function Home() {
  const [fileType, setFileType] = React.useState('all');
  const [plotType, setPlotType] = React.useState('all');
  const [view, setView] = React.useState('grid');
  const videoRef = useRef(null);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  useNavigate = useNavigate();
  // Effect to ensure the video plays on component mount
  useEffect(() => {
    // Check if the ref is attached to the video element
    if (videoRef.current) {
      // The play() method returns a promise, which can be ignored here
      videoRef.current.play().catch(error => {
        // Log any errors that might occur if autoplay is blocked
        console.error("Video autoplay was prevented:", error);
      });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    // Main container for the home page
    <Box
      sx={{
        position: 'relative', // Needed for video positioning
        minHeight: 'calc(100vh - 64px)', // Full height minus navbar
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        overflow: 'hidden', // Hide anything that might overflow
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef} // Attach the ref to the video element
        autoPlay
        loop
        muted
        playsInline 
        style={{
          position: 'absolute',
          width: '100%',
          height: '90%',
          objectFit: 'cover',
          top: 0,
          left: 0,
          zIndex: -2,
        }}
      >
        {/* The video file should be in the `public` folder */}
        <source src="/websiteVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Container */}
      <Container maxWidth="md">
        <Box sx={{
            textAlign: 'center',
            color: 'white',
            // Add a semi-transparent overlay to make text more readable
            backgroundColor: 'rgba(85, 110, 136, 0.52)',
            padding: 4,
            borderRadius: 2,
            }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Chart Studio Community Feed
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(212, 223, 218, 1)', mb: 4 }}>
            Search public charts by Chart Studio users
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type to search"
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<FavoriteBorderIcon />}
              sx={{ backgroundColor: 'white', color: '#df2b2bff', '&:hover': { backgroundColor: '#010928ff' } }}
            >
              Handpicked
            </Button>
            
            <FormControl sx={{ minWidth: 150, backgroundColor: 'white', borderRadius: 1 }}>
              <Select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                displayEmpty
                IconComponent={ArrowDropDownIcon}
              >
                <MenuItem value="all">All File Types</MenuItem>
                <MenuItem value="type1">Type 1</MenuItem>
                <MenuItem value="type2">Type 2</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150, backgroundColor: 'white', borderRadius: 1 }}>
              <Select
                value={plotType}
                onClick={() => F('PlotTypes.jsx')}
                onChange={(e) => setPlotType(e.target.value)}
                displayEmpty
                IconComponent={ArrowDropDownIcon}
              >
                <MenuItem value="all">All Plot Type</MenuItem>
                <MenuItem value="plot1">Plot 1</MenuItem>
                <MenuItem value="plot2">Plot 2</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* View Toggle */}
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view toggle"
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <AppsIcon sx={{ color: 'white' }} />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon sx={{ color: 'white' }} />
            </ToggleButton>
          </ToggleButtonGroup>

        </Box>
      </Container>
    </Box>
  );
}

export default Home;
