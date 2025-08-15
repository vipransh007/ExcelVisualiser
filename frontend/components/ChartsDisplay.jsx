import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { 
  Box, 
  CircularProgress, 
  Alert, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  IconButton,
  Chip
} from '@mui/material';
import { Visibility, Close } from '@mui/icons-material';

function ChartDisplay() {
  // State to hold the random graphs data
  const [graphs, setGraphs] = useState([]);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the modal
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Function to fetch random graph data from the community feed
    const fetchRandomGraphs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch random graphs from the community feed endpoint
        const response = await axios.get('/api/v1/graphs/community-feed');
        
        if (response.data.success) {
          setGraphs(response.data.data);
        } else {
          setError("Failed to fetch graphs data");
        }

      } catch (err) {
        console.error("Failed to fetch random graphs:", err);
        setError("Could not load the graphs from the server. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchRandomGraphs();
  }, []); // The empty array ensures this runs only once when the component mounts

  // Handle opening the modal
  const handleViewGraph = (graph) => {
    setSelectedGraph(graph);
    setModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedGraph(null);
  };

  // Show a loading spinner while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show an error message if the fetch failed
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // If no graphs are available
  if (!graphs || graphs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography variant="h6" color="text.secondary">
          No graphs available in the community feed.
        </Typography>
      </Box>
    );
  }

  // Render the random graphs in a grid layout with cards
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Community Feed - Random Graphs ({graphs.length} graphs)
      </Typography>
      
      <Grid container spacing={3}>
        {graphs.map((graph, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={graph._id || index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  '& .view-button': {
                    opacity: 1
                  }
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {graph.name || `Graph ${index + 1}`}
                  </Typography>
                  <Chip 
                    label={`#${index + 1}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                {graph.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      minHeight: '3rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {graph.description}
                  </Typography>
                )}
                
                {/* Thumbnail preview of the graph */}
                <Box sx={{ 
                  height: 200, 
                  width: '100%', 
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Plot
                    data={graph.data || []}
                    layout={{
                      ...graph.layout,
                      autosize: true,
                      margin: { l: 30, r: 30, t: 30, b: 30 },
                      height: 180,
                      showlegend: false,
                      title: { text: '' } // Remove title for thumbnail
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Created: {new Date(graph.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ 
                p: 2, 
                pt: 0,
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
                '&.view-button': {
                  opacity: 0
                }
              }} className="view-button">
                <Button 
                  variant="contained" 
                  startIcon={<Visibility />}
                  onClick={() => handleViewGraph(graph)}
                  fullWidth
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  View Graph
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal for viewing graphs in full size */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant="h5" component="div">
              {selectedGraph?.name}
            </Typography>
            {selectedGraph?.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedGraph.description}
              </Typography>
            )}
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedGraph && (
            <Box sx={{ width: '100%', height: '100%' }}>
              <Plot
                data={selectedGraph.data || []}
                layout={{
                  ...selectedGraph.layout,
                  autosize: true,
                  height: 600,
                  margin: { l: 60, r: 60, t: 60, b: 60 }
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
                config={{ 
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ChartDisplay;
