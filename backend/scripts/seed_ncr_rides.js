// backend/scripts/seed_ncr_rides.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants.js';

// Import your Graph model
import Graph from '../models/model.graphs.js';

// --- Replicating __dirname functionality in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- User ID ---
const SEED_USER_ID = '688871bf17e74c37c7187042';

// --- Configuration ---
const csvFilePath = path.resolve(__dirname, '../data/ncr_ride_bookings.csv');

// --- Database Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// --- CSV Processing ---
const processCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// --- Create Graph Data ---
const createNCRRidesGraph = (data) => {
  // Take a sample of data for better visualization (first 2000 records)
  const sampleData = data.slice(0, 2000);
  
  // Analyze ride status distribution
  const statusCounts = {};
  sampleData.forEach(row => {
    const status = row.ride_status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Create bar chart for ride status
  const trace1 = {
    x: Object.keys(statusCounts),
    y: Object.values(statusCounts),
    type: 'bar',
    name: 'Ride Status Distribution',
    marker: {
      color: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
      opacity: 0.8
    },
    text: Object.values(statusCounts).map(count => count.toString()),
    textposition: 'auto',
    hovertemplate: 
      '<b>Status: %{x}</b><br>' +
      'Count: %{y}<br>' +
      '<extra></extra>'
  };

  // Analyze ride type distribution
  const rideTypeCounts = {};
  sampleData.forEach(row => {
    const rideType = row.ride_type || 'Unknown';
    rideTypeCounts[rideType] = (rideTypeCounts[rideType] || 0) + 1;
  });

  // Create pie chart for ride types
  const trace2 = {
    labels: Object.keys(rideTypeCounts),
    values: Object.values(rideTypeCounts),
    type: 'pie',
    name: 'Ride Type Distribution',
    hole: 0.4,
    marker: {
      colors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22']
    },
    hovertemplate: 
      '<b>Ride Type: %{label}</b><br>' +
      'Count: %{value}<br>' +
      'Percentage: %{percent}<br>' +
      '<extra></extra>',
    domain: { x: [0.55, 1], y: [0, 0.45] }
  };

  // Analyze time-based patterns (if available)
  const timePatterns = {};
  sampleData.forEach(row => {
    if (row.booking_time) {
      const hour = new Date(row.booking_time).getHours();
      const timeSlot = `${hour}:00-${hour+1}:00`;
      timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1;
    }
  });

  // Create line chart for time patterns
  const trace3 = {
    x: Object.keys(timePatterns).sort(),
    y: Object.keys(timePatterns).sort().map(key => timePatterns[key]),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Hourly Booking Patterns',
    line: { color: '#34495e', width: 3 },
    marker: { size: 8, color: '#34495e' },
    hovertemplate: 
      '<b>Time: %{x}</b><br>' +
      'Bookings: %{y}<br>' +
      '<extra></extra>',
    domain: { x: [0, 0.45], y: [0, 0.45] }
  };

  const layout = {
    title: {
      text: 'NCR Ride Bookings Analysis Dashboard',
      font: { size: 20, color: '#2c3e50' }
    },
    grid: {
      rows: 2,
      columns: 2,
      pattern: 'independent'
    },
    xaxis: {
      title: {
        text: 'Ride Status',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    yaxis: {
      title: {
        text: 'Number of Bookings',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    xaxis2: {
      title: {
        text: 'Hour of Day',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7',
      domain: [0, 0.45]
    },
    yaxis2: {
      title: {
        text: 'Number of Bookings',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7',
      domain: [0, 0.45]
    },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    hovermode: 'closest',
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#bdc3c7'
    },
    margin: { l: 60, r: 30, t: 60, b: 60 },
    annotations: [
      {
        text: 'Ride Status Distribution',
        showarrow: false,
        xref: 'paper',
        yref: 'paper',
        x: 0.25,
        y: 0.95,
        font: { size: 12, color: '#7f8c8d' }
      },
      {
        text: 'Hourly Booking Patterns',
        showarrow: false,
        xref: 'paper',
        yref: 'paper',
        x: 0.25,
        y: 0.45,
        font: { size: 12, color: '#7f8c8d' }
      },
      {
        text: 'Ride Type Distribution',
        showarrow: false,
        xref: 'paper',
        yref: 'paper',
        x: 0.75,
        y: 0.45,
        font: { size: 12, color: '#7f8c8d' }
      }
    ]
  };

  return {
    data: [trace1, trace2, trace3],
    layout: layout
  };
};

// --- Main Function ---
const main = async () => {
  try {
    console.log('🚀 Starting NCR Ride Bookings Dataset Seeding...');
    
    // Connect to database
    await connectDB();
    
    // Process CSV data
    console.log('📊 Processing CSV data...');
    const csvData = await processCSV();
    console.log(`✅ Processed ${csvData.length} records`);
    
    // Create graph data
    console.log('📈 Creating graph visualization...');
    const graphData = createNCRRidesGraph(csvData);
    
    // Create Graph document
    const graph = new Graph({
      name: 'NCR Ride Bookings Dashboard',
      description: 'Multi-panel dashboard showing ride status distribution, hourly booking patterns, and ride type distribution for NCR ride booking services.',
      data: graphData.data,
      layout: graphData.layout,
      user: SEED_USER_ID,
      type: 'dashboard',
      tags: ['ride-bookings', 'transportation', 'ncr', 'dashboard', 'bar-chart', 'pie-chart', 'time-series']
    });
    
    // Save to database
    await graph.save();
    console.log('✅ NCR rides graph saved successfully!');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

// Run the script
main();
