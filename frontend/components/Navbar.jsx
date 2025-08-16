import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Link, ButtonGroup, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import { Link as RouterLink } from 'react-router-dom';
import {  useAuth } from '../src/context/AuthContext.jsx'; // Import the Auth
 // Import the useAuth hook
 import { useNavigate } from 'react-router-dom';

const PlotlyLogoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 15v-4h6v4H9z"></path>
    </svg>
);

function Navbar() {
  // 2. Use the context to get authentication status, user data, and the logout function
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Debug logging
  // console.log('Navbar render:', { isAuthenticated, user, loading });

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Redirect to home page after logout
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setAnchorEl(null);
  };

  const handleSignupClick = () => {
    navigate('/signup');
    setAnchorEl(null);
  };

  return (
    <AppBar 
        position="static" 
        color="default" 
        elevation={1} 
        sx={{ backgroundColor: 'white' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Box onClick={() => navigate('/')} sx={{ width: 32, height: 32, backgroundColor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
              <PlotlyLogoIcon />
            </Box>
            <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              plotly
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Link href="#" color="text.secondary" underline="hover">Chart Studio</Link>
            <Typography color="text.disabled">|</Typography>
            <Link href="#" color="text.secondary" underline="hover">plotly.com</Link>
            <Link href="#" color="text.secondary" underline="hover">My Files</Link>
          </Box>
        </Box>

        {/* --- Right Section: CONDITIONAL DISPLAY --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* We wait for the initial loading check to complete before showing any buttons */}
          {!loading && (
            <>
              {/* <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Create
              </Button> */}
              {user?.username}
              {isAuthenticated ? (
                // If user IS logged in, show avatar with dropdown
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{ p: 0 }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        cursor: 'pointer',
                        '& img': {
                          objectFit: 'cover'
                        }
                      }}
                      src={user?.avatar}
                      alt={user?.username}
                    >
                      {!user?.avatar && <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        Welcome, {user?.username}
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                // If user IS NOT logged in, show the original login/signup buttons
                <ButtonGroup disableElevation variant="contained">
                  <Button onClick={() => navigate('/login')}>Login</Button>
                  <Button onClick={() => navigate('/signup')}>SignUp</Button>
                </ButtonGroup>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
