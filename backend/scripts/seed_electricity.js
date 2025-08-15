// backend/scripts/seed_electricity.js

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
const csvFilePath = path.resolve(__dirname, '../data/electricity.csv');

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
const createElectricityGraph = (data) => {
  // Take a sample of data for better visualization (first 1000 records)
  const sampleData = data.slice(0, 1000);
  
  // Create time series data for electricity consumption
  const trace1 = {
    x: sampleData.map((row, index) => index), // Using index as x-axis for simplicity
    y: sampleData.map(row => parseFloat(row.consumption) || parseFloat(row.usage) || parseFloat(row.value) || 0),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Electricity Consumption',
    line: { color: '#e74c3c', width: 1 },
    marker: { size: 3, color: '#e74c3c' },
    text: sampleData.map((row, index) => `Consumption: ${row.consumption || row.usage || row.value || 0} kWh<br>Index: ${index}<br>Date: ${row.date || row.time || 'N/A'}`),
    hoverinfo: 'text'
  };

  // Create histogram for consumption distribution
  const consumptionValues = sampleData.map(row => parseFloat(row.consumption) || parseFloat(row.usage) || parseFloat(row.value) || 0).filter(val => !isNaN(val));
  
  const trace2 = {
    x: consumptionValues,
    type: 'histogram',
    name: 'Consumption Distribution',
    marker: {
      color: '#3498db',
      opacity: 0.7
    },
    nbinsx: 30,
    hovertemplate: 
      '<b>Consumption Range</b><br>' +
      'Count: %{y}<br>' +
      'Range: %{x}<br>' +
      '<extra></extra>',
    xaxis: 'x2',
    yaxis: 'y2'
  };

  const layout = {
    title: {
      text: 'Electricity Consumption Analysis Dashboard',
      font: { size: 20, color: '#2c3e50' }
    },
    grid: {
      rows: 2,
      columns: 2,
      pattern: 'independent'
    },
    xaxis: {
      title: {
        text: 'Time Series Index',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    yaxis: {
      title: {
        text: 'Consumption (kWh)',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    xaxis2: {
      title: {
        text: 'Consumption (kWh)',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7',
      domain: [0.55, 1]
    },
    yaxis2: {
      title: {
        text: 'Frequency',
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
        text: 'Time Series: Electricity consumption over time',
        showarrow: false,
        xref: 'paper',
        yref: 'paper',
        x: 0.25,
        y: 0.95,
        font: { size: 12, color: '#7f8c8d' }
      },
      {
        text: 'Distribution: Consumption frequency analysis',
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
    data: [trace1, trace2],
    layout: layout
  };
};

// --- Main Function ---
const main = async () => {
  try {
    console.log('🚀 Starting Electricity Dataset Seeding...');
    
    // Connect to database
    await connectDB();
    
    // Process CSV data
    console.log('📊 Processing CSV data...');
    const csvData = await processCSV();
    console.log(`✅ Processed ${csvData.length} records`);
    
    // Create graph data
    console.log('📈 Creating graph visualization...');
    const graphData = createElectricityGraph(csvData);
    
    // Create Graph document
    const graph = new Graph({
      name: 'Electricity Consumption Analysis',
      description: 'Multi-panel dashboard showing electricity consumption time series patterns and distribution analysis. Includes time series visualization and histogram analysis.',
      data: graphData.data,
      layout: graphData.layout,
      user: SEED_USER_ID,
      type: 'multi-panel',
      tags: ['electricity', 'consumption', 'energy', 'time-series', 'distribution', 'histogram', 'analysis']
    });
    
    // Save to database
    await graph.save();
    console.log('✅ Electricity graph saved successfully!');
    
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
