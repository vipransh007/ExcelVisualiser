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

function Home() {

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

      {/* Content Container */}
      <Container maxWidth="md">
        <Box sx={{
            textAlign: 'center',
            color: 'white',
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

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type to search"
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              mb: 3,
              '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'transparent' } },
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
              sx={{ backgroundColor: 'white', color: '#df2b2bff', '&:hover': { backgroundColor: '#9298b1ff' } }}
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
                onChange={handlePlotTypeChange}
                displayEmpty
                IconComponent={ArrowDropDownIcon}
              >
                <MenuItem value="all">All Plot Types</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="scatter">Scatter Plot</MenuItem>
                <MenuItem 
                  value="browse-all" 
                  sx={{color: 'primary.main', fontWeight: 'bold', borderTop: '1px solid #eee', mt: 1}}
                >
                  Browse all types...
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          
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
