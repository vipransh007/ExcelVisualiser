import { AppBar, Toolbar, Typography, Button, Box, Link, ButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';

// A simple Plotly-style logo icon component for the navbar
const PlotlyLogoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 15v-4h6v4H9z"></path>
    </svg>
);

// The main Navbar component using Material-UI
function Navbar() {
  const navigate = useNavigate();
  return (
    <AppBar 
        position="static" 
        color="default" 
        elevation={1} 
        sx={{ backgroundColor: 'white' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section: Logo and Links */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Plotly Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
              onClick={() => navigate('/')}
            >
              <PlotlyLogoIcon />
            </Box>
            <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              plotly
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Link href="#" color="text.secondary" underline="hover">
              Chart Studio
            </Link>
            <Typography color="text.disabled">|</Typography>
            <Link href="#" color="text.secondary" underline="hover">
              plotly.com
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              My Files
            </Link>
          </Box>
        </Box>

        {/* Right Section: Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Create Button */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Create
          </Button>

          {/* Login/SignUp Buttons */}
          <ButtonGroup
            disableElevation
            variant="contained"
            aria-label="login and sign up button group"
          >
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/signup')}>SignUp</Button>
          </ButtonGroup>

        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
