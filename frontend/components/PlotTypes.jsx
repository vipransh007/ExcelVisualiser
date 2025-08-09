import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// --- Placeholder Icons ---
// In a real app, you would replace these with actual SVG icons for each chart type.
import ScatterPlotIcon from '@mui/icons-material/BubbleChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import LineChartIcon from '@mui/icons-material/ShowChart';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import MapIcon from '@mui/icons-material/Map';
import PublicIcon from '@mui/icons-material/Public';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import LooksOneIcon from '@mui/icons-material/LooksOne'; // Placeholder for 3D
import GrainIcon from '@mui/icons-material/Grain'; // Placeholder for specialized
import AppsIcon from '@mui/icons-material/Apps'; // <-- Added this missing import


const plotCategories = [
  {
    title: 'Simple',
    plots: [
      { name: 'Scatter', icon: <ScatterPlotIcon /> },
      { name: 'Bar', icon: <BarChartIcon /> },
      { name: 'Line', icon: <LineChartIcon /> },
      { name: 'Area', icon: <AreaChartIcon /> },
      { name: 'Heatmap', icon: <div style={{width: 24, height: 24, background: 'linear-gradient(45deg, #f44336, #2196f3)'}}/> },
      { name: 'Table', icon: <TableChartIcon /> },
      { name: 'Contour', icon: <LooksOneIcon /> },
      { name: 'Pie', icon: <PieChartIcon /> },
    ],
  },
  {
    title: 'Distributions',
    plots: [
        { name: 'Box', icon: <CandlestickChartIcon style={{transform: 'rotate(90deg)'}}/> },
        { name: 'Violin', icon: <GrainIcon /> },
        { name: 'Histogram', icon: <BarChartIcon /> },
        { name: '2D Histogram', icon: <AppsIcon /> },
        { name: '2D Contour', icon: <DonutLargeIcon /> },
    ]
  },
  {
      title: '3D',
      plots: [
          { name: '3D Scatter', icon: <LooksOneIcon /> },
          { name: '3D Line', icon: <LooksOneIcon /> },
          { name: '3D Surface', icon: <LooksOneIcon /> },
          { name: '3D Mesh', icon: <LooksOneIcon /> },
          { name: 'Cone', icon: <LooksOneIcon /> },
          { name: 'Streamtube', icon: <LooksOneIcon /> },
      ]
  },
  {
      title: 'Maps',
      plots: [
          { name: 'Tile Map', icon: <MapIcon /> },
          { name: 'Atlas Map', icon: <PublicIcon /> },
          { name: 'Choropleth Tile', icon: <MapIcon /> },
          { name: 'Choropleth Atlas', icon: <PublicIcon /> },
          { name: 'Density Tile Map', icon: <MapIcon /> },
      ]
  },
   {
      title: 'Finance',
      plots: [
          { name: 'Candlestick', icon: <CandlestickChartIcon /> },
          { name: 'OHLC', icon: <CandlestickChartIcon /> },
          { name: 'Waterfall', icon: <BarChartIcon /> },
          { name: 'Funnel', icon: <AreaChartIcon style={{transform: 'rotate(180deg)'}}/> },
          { name: 'Funnel Area', icon: <AreaChartIcon /> },
      ]
  },
  {
      title: 'Specialized',
      plots: [
          { name: 'Polar Scatter', icon: <GrainIcon /> },
          { name: 'Polar Bar', icon: <GrainIcon /> },
          { name: 'Ternary Scatter', icon: <GrainIcon /> },
          { name: 'Sunburst', icon: <PieChartIcon /> },
          { name: 'Treemap', icon: <AppsIcon /> },
          { name: 'Sankey', icon: <LineChartIcon /> },
          { name: 'Parallel Coordinates', icon: <BarChartIcon /> },
          { name: 'Carpet', icon: <TableChartIcon /> },
      ]
  }
];

const ChartCard = ({ name, icon }) => (
  <Card sx={{ textAlign: 'center', '&:hover': { boxShadow: 6, cursor: 'pointer' } }}>
    <CardContent>
      <Box sx={{ fontSize: 40, mb: 1, color: 'primary.main' }}>{icon}</Box>
      <Typography variant="body2">{name}</Typography>
    </CardContent>
  </Card>
);

function PlotTypes({ navigateTo }) {
  return (
    <Box sx={{ bgcolor: '#e3f2fd', p: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
            Select Trace Type
          </Typography>
          <IconButton  >
            <CloseIcon />

          </IconButton>
        </Box>

        <Grid container spacing={4}>
          {plotCategories.map((category) => (
            <Grid item xs={12} md={6} lg={4} key={category.title}>
              <Typography variant="h6" gutterBottom>
                {category.title}
              </Typography>
              <Grid container spacing={2}>
                {category.plots.map((plot) => (
                  <Grid item xs={6} sm={4} key={plot.name}>
                    <ChartCard name={plot.name} icon={plot.icon} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default PlotTypes;
