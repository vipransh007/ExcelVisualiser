// backend/scripts/seed_placement.js

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
const csvFilePath = path.resolve(__dirname, '../data/Placement.csv');

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
const createPlacementGraph = (data) => {
  // Separate data by placement status
  const placed = data.filter(row => row.Placed === 'Yes');
  const notPlaced = data.filter(row => row.Placed === 'No');

  // Create scatter plot data
  const trace1 = {
    x: placed.map(row => parseFloat(row.CGPA)),
    y: placed.map(row => parseFloat(row['Salary (INR LPA)'])),
    mode: 'markers',
    type: 'scatter',
    name: 'Placed',
    marker: {
      color: 'green',
      size: 8,
      opacity: 0.7
    },
    text: placed.map(row => `CGPA: ${row.CGPA}<br>Salary: ${row['Salary (INR LPA)']} LPA<br>Internships: ${row.Internships}`),
    hoverinfo: 'text'
  };

  const trace2 = {
    x: notPlaced.map(row => parseFloat(row.CGPA)),
    y: notPlaced.map(row => parseFloat(row['Salary (INR LPA)'])),
    mode: 'markers',
    type: 'scatter',
    name: 'Not Placed',
    marker: {
      color: 'red',
      size: 8,
      opacity: 0.7
    },
    text: notPlaced.map(row => `CGPA: ${row.CGPA}<br>Salary: ${row['Salary (INR LPA)']} LPA<br>Internships: ${row.Internships}`),
    hoverinfo: 'text'
  };

  const layout = {
    title: {
      text: 'Student Placement Analysis: CGPA vs Salary',
      font: { size: 20, color: '#2c3e50' }
    },
    xaxis: {
      title: {
        text: 'CGPA (Cumulative Grade Point Average)',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    yaxis: {
      title: {
        text: 'Salary (INR LPA)',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
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
    margin: { l: 60, r: 30, t: 60, b: 60 }
  };

  return {
    data: [trace1, trace2],
    layout: layout
  };
};

// --- Main Function ---
const main = async () => {
  try {
    console.log('🚀 Starting Placement Dataset Seeding...');
    
    // Connect to database
    await connectDB();
    
    // Process CSV data
    console.log('📊 Processing CSV data...');
    const csvData = await processCSV();
    console.log(`✅ Processed ${csvData.length} records`);
    
    // Create graph data
    console.log('📈 Creating graph visualization...');
    const graphData = createPlacementGraph(csvData);
    
    // Create Graph document
    const graph = new Graph({
      name: 'Student Placement Analysis',
      description: 'Scatter plot showing the relationship between CGPA and Salary for placed vs non-placed students. Green dots represent placed students, red dots represent non-placed students.',
      data: graphData.data,
      layout: graphData.layout,
      user: SEED_USER_ID,
      type: 'scatter',
      tags: ['placement', 'education', 'salary', 'cgpa', 'students']
    });
    
    // Save to database
    await graph.save();
    console.log('✅ Placement graph saved successfully!');
    
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
