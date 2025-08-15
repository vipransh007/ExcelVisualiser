// backend/scripts/seed_rainfall.js

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
const csvFilePath = path.resolve(__dirname, '../data/weatherAUS_rainfall_prediction_dataset_cleaned.csv');

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
const createRainfallGraph = (data) => {
  // Take a sample of data for better visualization (first 1000 records)
  const sampleData = data.slice(0, 1000);
  
  // Create time series data for rainfall
  const trace1 = {
    x: sampleData.map((row, index) => index), // Using index as x-axis for simplicity
    y: sampleData.map(row => parseFloat(row.Rainfall) || 0),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Rainfall (mm)',
    line: { color: '#3498db', width: 1 },
    marker: { size: 3, color: '#3498db' },
    text: sampleData.map(row => `Rainfall: ${row.Rainfall || 0} mm<br>Date: ${row.Date || 'N/A'}<br>Location: ${row.Location || 'N/A'}`),
    hoverinfo: 'text'
  };

  // Create humidity correlation
  const trace2 = {
    x: sampleData.map(row => parseFloat(row.Humidity3pm) || 0),
    y: sampleData.map(row => parseFloat(row.Rainfall) || 0),
    mode: 'markers',
    type: 'scatter',
    name: 'Humidity vs Rainfall',
    marker: {
      color: sampleData.map(row => parseFloat(row.Rainfall) || 0),
      colorscale: 'Blues',
      size: 6,
      opacity: 0.7,
      showscale: true,
      colorbar: { title: 'Rainfall (mm)' }
    },
    text: sampleData.map(row => `Humidity: ${row.Humidity3pm || 0}%<br>Rainfall: ${row.Rainfall || 0} mm<br>Location: ${row.Location || 'N/A'}`),
    hoverinfo: 'text',
    xaxis: 'x2',
    yaxis: 'y2'
  };

  const layout = {
    title: {
      text: 'Australian Rainfall Analysis & Prediction',
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
        text: 'Rainfall (mm)',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    xaxis2: {
      title: {
        text: 'Humidity 3pm (%)',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7',
      domain: [0.55, 1]
    },
    yaxis2: {
      title: {
        text: 'Rainfall (mm)',
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
        text: 'Time Series: Rainfall patterns over time',
        showarrow: false,
        xref: 'paper',
        yref: 'paper',
        x: 0.25,
        y: 0.95,
        font: { size: 12, color: '#7f8c8d' }
      },
      {
        text: 'Correlation: Humidity vs Rainfall',
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
    console.log('🚀 Starting Rainfall Dataset Seeding...');
    
    // Connect to database
    await connectDB();
    
    // Process CSV data
    console.log('📊 Processing CSV data...');
    const csvData = await processCSV();
    console.log(`✅ Processed ${csvData.length} records`);
    
    // Create graph data
    console.log('📈 Creating graph visualization...');
    const graphData = createRainfallGraph(csvData);
    
    // Create Graph document
    const graph = new Graph({
      name: 'Australian Rainfall Analysis',
      description: 'Multi-panel visualization showing rainfall time series patterns and correlation between humidity and rainfall. Includes time series analysis and scatter plot correlation.',
      data: graphData.data,
      layout: graphData.layout,
      user: SEED_USER_ID,
      type: 'multi-panel',
      tags: ['rainfall', 'weather', 'australia', 'prediction', 'time-series', 'correlation', 'humidity']
    });
    
    // Save to database
    await graph.save();
    console.log('✅ Rainfall graph saved successfully!');
    
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
