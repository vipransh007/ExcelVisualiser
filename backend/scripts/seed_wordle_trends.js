// backend/scripts/seed_wordle_trends.js

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
const csvFilePath = path.resolve(__dirname, '../data/wordle_trend_data.csv');

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
const createWordleTrendsGraph = (data) => {
  // Sort data by date
  const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Take last 100 entries for better visualization
  const recentData = sortedData.slice(-100);
  
  // Create line chart data
  const trace1 = {
    x: recentData.map(row => row.date),
    y: recentData.map(row => parseFloat(row.trend_day_global) || 0),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Global Trend (Daily)',
    line: { color: '#3498db', width: 2 },
    marker: { size: 4, color: '#3498db' },
    text: recentData.map(row => `Date: ${row.date}<br>Word: ${row.word}<br>Global Trend: ${row.trend_day_global}<br>Game: ${row.game}`),
    hoverinfo: 'text'
  };

  const trace2 = {
    x: recentData.map(row => row.date),
    y: recentData.map(row => parseFloat(row.trend_avg_200_global) || 0),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Global Trend (200-day Avg)',
    line: { color: '#e74c3c', width: 2, dash: 'dash' },
    marker: { size: 4, color: '#e74c3c' },
    text: recentData.map(row => `Date: ${row.date}<br>Word: ${row.word}<br>200-day Avg: ${row.trend_avg_200_global}<br>Game: ${row.game}`),
    hoverinfo: 'text'
  };

  const trace3 = {
    x: recentData.map(row => row.date),
    y: recentData.map(row => parseFloat(row.wordfreq_commonality) || 0),
    mode: 'lines+markers',
    type: 'scatter',
    name: 'Word Frequency Commonality',
    line: { color: '#2ecc71', width: 2 },
    marker: { size: 4, color: '#2ecc71' },
    text: recentData.map(row => `Date: ${row.date}<br>Word: ${row.word}<br>Frequency: ${row.wordfreq_commonality}<br>Game: ${row.game}`),
    hoverinfo: 'text',
    yaxis: 'y2'
  };

  const layout = {
    title: {
      text: 'Wordle Trends Analysis: Global Popularity & Word Frequency',
      font: { size: 20, color: '#2c3e50' }
    },
    xaxis: {
      title: {
        text: 'Date',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7',
      type: 'date'
    },
    yaxis: {
      title: {
        text: 'Trend Score',
        font: { size: 14, color: '#34495e' }
      },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7',
      range: [0, 100]
    },
    yaxis2: {
      title: {
        text: 'Word Frequency Commonality',
        font: { size: 14, color: '#2ecc71' }
      },
      overlaying: 'y',
      side: 'right',
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
    margin: { l: 60, r: 60, t: 60, b: 60 },
    annotations: [
      {
        text: 'Higher trend scores indicate more popular words',
        showarrow: false,
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: -0.15,
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
    console.log('🚀 Starting Wordle Trends Dataset Seeding...');
    
    // Connect to database
    await connectDB();
    
    // Process CSV data
    console.log('📊 Processing CSV data...');
    const csvData = await processCSV();
    console.log(`✅ Processed ${csvData.length} records`);
    
    // Create graph data
    console.log('📈 Creating graph visualization...');
    const graphData = createWordleTrendsGraph(csvData);
    
    // Create Graph document
    const graph = new Graph({
      name: 'Wordle Trends Analysis',
      description: 'Line chart showing Wordle word trends over time, including daily global trends, 200-day averages, and word frequency commonality. Higher trend scores indicate more popular words.',
      data: graphData.data,
      layout: graphData.layout,
      user: SEED_USER_ID,
      type: 'line',
      tags: ['wordle', 'trends', 'gaming', 'language', 'popularity', 'time-series']
    });
    
    // Save to database
    await graph.save();
    console.log('✅ Wordle trends graph saved successfully!');
    
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
