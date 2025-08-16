import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { CloudUpload, Add, Visibility } from '@mui/icons-material';
import Plot from 'react-plotly.js';
import axios from 'axios';

function CreateChart({ onChartCreated }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [chartType, setChartType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [columns, setColumns] = useState([]);

  // Chart type options based on our implemented seeds
  const chartTypes = [
    { value: 'scatter', label: 'Scatter Plot', description: 'Perfect for showing relationships between two variables (e.g., Age vs Blood Pressure, CGPA vs Salary)' },
    { value: 'line', label: 'Line Chart', description: 'Great for time series data and trends over time (e.g., Wordle trends, Rainfall patterns, Electricity consumption)' },
    { value: 'bar', label: 'Bar Chart', description: 'Excellent for categorical data and frequency distributions (e.g., Ride status, Ride types, Hourly patterns)' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setPreviewData(null);
      setColumns([]);
      analyzeCSV(file);
    } else {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const analyzeCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Get first few rows for preview
        const previewRows = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        setColumns(headers);
        setPreviewData(previewRows);
      } catch (err) {
        setError('Error reading CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateChart = async () => {
    if (!selectedFile || !chartType) {
      setError('Please select both a file and chart type');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);
      formData.append('chartType', chartType);
      formData.append('columns', JSON.stringify(columns));

      const response = await axios.post('/api/v1/graphs/create-from-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('Chart created successfully!');
        setSelectedFile(null);
        setChartType('');
        setPreviewData(null);
        setColumns([]);
        // Reset file input
        document.getElementById('csv-file-input').value = '';
        
        // Notify parent component to refresh graphs
        if (onChartCreated) {
          onChartCreated();
        }
      } else {
        setError(response.data.message || 'Failed to create chart');
      }
    } catch (err) {
      console.error('Error creating chart:', err);
      setError('Failed to create chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedChartType = () => {
    if (!columns.length) return '';
    
    // Auto-detect chart type based on column names and data
    const hasDate = columns.some(col => 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('day')
    );
    
    const hasNumeric = columns.some(col => 
      previewData?.some(row => !isNaN(parseFloat(row[col])))
    );

    if (hasDate && hasNumeric) return 'line';
    if (hasNumeric && columns.length >= 2) return 'scatter';
    return 'bar';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Create Chart from CSV
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Step 1: Upload CSV File
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="csv-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              sx={{ minWidth: 200 }}
            >
              Choose CSV File
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" color="text.secondary">
              Selected: {selectedFile.name}
            </Typography>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      </Paper>

      {selectedFile && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Step 2: Choose Chart Type
          </Typography>
          
          <Grid container spacing={3}>
            {chartTypes.map((type) => (
              <Grid item xs={12} md={4} key={type.value}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: chartType === type.value ? '2px solid' : '1px solid',
                    borderColor: chartType === type.value ? 'primary.main' : 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => setChartType(type.value)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {type.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {type.description}
                    </Typography>
                    {getRecommendedChartType() === type.value && (
                      <Chip 
                        label="Recommended" 
                        color="success" 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                    )}
                    <Button
                      variant={chartType === type.value ? "contained" : "outlined"}
                      startIcon={<Add />}
                      fullWidth
                    >
                      {chartType === type.value ? "Selected" : "Select"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {selectedFile && previewData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Step 3: Preview Your Data
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Detected {columns.length} columns: {columns.join(', ')}
            </Typography>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px', 
                      backgroundColor: '#f5f5f5',
                      textAlign: 'left'
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px',
                        fontSize: '12px'
                      }}>
                        {row[col] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {selectedFile && chartType && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Step 4: Create Your Chart
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateChart}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Creating Chart...' : 'Create Chart'}
          </Button>
        </Paper>
      )}

      {!selectedFile && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <CloudUpload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Ready to create amazing charts?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your CSV file and choose from our supported chart types to visualize your data
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default CreateChart;
