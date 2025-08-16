import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import { BarChart, CloudUpload } from '@mui/icons-material';

function Navigation({ currentView, onViewChange }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      mb: 3, 
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1
    }}>
      <ButtonGroup variant="outlined" size="large">
        <Button
          startIcon={<BarChart />}
          onClick={() => onViewChange('community')}
          variant={currentView === 'community' ? 'contained' : 'outlined'}
        >
          Community Feed
        </Button>
        <Button
          startIcon={<CloudUpload />}
          onClick={() => onViewChange('create')}
          variant={currentView === 'create' ? 'contained' : 'outlined'}
        >
          Create Chart
        </Button>
      </ButtonGroup>
    </Box>
  );
}

export default Navigation;
