// backend/scripts/seed_lol_champions.js

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
const csvFilePath = path.resolve(__dirname, '../data/080725_LoL_champion_data.csv');

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
const createLoLChampionsGraph = (data) => {
  // Filter out rows with missing data and select top champions
  const validChampions = data.filter(row => 
    row.damage && row.toughness && row.control && row.mobility && row.utility &&
    row.damage !== 'nan' && row.toughness !== 'nan' && row.control !== 'nan' && 
    row.mobility !== 'nan' && row.utility !== 'nan'
  ).slice(0, 20); // Take top 20 champions for better visualization

  // Create radar chart data for multiple champions
  const traces = validChampions.map((champion, index) => {
    const colors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
      '#1abc9c', '#e67e22', '#34495e', '#16a085', '#8e44ad',
      '#27ae60', '#d35400', '#c0392b', '#2980b9', '#f1c40f',
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'
    ];

    return {
      r: [
        parseInt(champion.damage),
        parseInt(champion.toughness),
        parseInt(champion.control),
        parseInt(champion.mobility),
        parseInt(champion.utility)
      ],
      theta: ['Damage', 'Toughness', 'Control', 'Mobility', 'Utility'],
      fill: 'toself',
      name: champion.title || champion.apiname || `Champion ${index + 1}`,
      line: { color: colors[index % colors.length], width: 2 },
      fillcolor: colors[index % colors.length] + '20',
      hovertemplate: 
        `<b>${champion.title || champion.apiname}</b><br>` +
        `Damage: ${champion.damage}<br>` +
        `Toughness: ${champion.toughness}<br>` +
        `Control: ${champion.control}<br>` +
        `Mobility: ${champion.mobility}<br>` +
        `Utility: ${champion.utility}<br>` +
        `Difficulty: ${champion.difficulty}<br>` +
        `Role: ${champion.role || 'N/A'}<br>` +
        `<extra></extra>`
    };
  });

  const layout = {
    title: {
      text: 'League of Legends Champion Stats Comparison',
      font: { size: 20, color: '#2c3e50' }
    },
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 10],
        ticktext: ['0', '2', '4', '6', '8', '10'],
        tickvals: [0, 2, 4, 6, 8, 10],
        gridcolor: '#ecf0f1',
        linecolor: '#bdc3c7'
      },
      angularaxis: {
        gridcolor: '#ecf0f1',
        linecolor: '#bdc3c7'
      },
      bgcolor: '#ffffff'
    },
    showlegend: true,
    legend: {
      x: 1.1,
      y: 0.5,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#bdc3c7',
      font: { size: 10 }
    },
    paper_bgcolor: '#ffffff',
    margin: { l: 50, r: 200, t: 50, b: 50 },
    annotations: [
      {
        text: 'Stats range from 0-10<br>Higher values = Better performance',
        showarrow: false,
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: -0.15,
        font: { size: 12, color: '#7f8c8d' },
        align: 'center'
      }
    ]
  };

  return {
    data: traces,
    layout: layout
  };
};

// --- Main Function ---
const main = async () => {
  try {
    console.log('🚀 Starting League of Legends Champions Dataset Seeding...');
    
    // Connect to database
    await connectDB();
    
    // Process CSV data
    console.log('📊 Processing CSV data...');
    const csvData = await processCSV();
    console.log(`✅ Processed ${csvData.length} records`);
    
    // Create graph data
    console.log('📈 Creating graph visualization...');
    const graphData = createLoLChampionsGraph(csvData);
    
    // Create Graph document
    const graph = new Graph({
      name: 'LoL Champion Stats Comparison',
      description: 'Radar chart comparing League of Legends champion statistics including Damage, Toughness, Control, Mobility, and Utility. Each champion is represented by a different colored polygon.',
      data: graphData.data,
      layout: graphData.layout,
      user: SEED_USER_ID,
      type: 'radar',
      tags: ['league-of-legends', 'gaming', 'champions', 'stats', 'comparison', 'radar-chart']
    });
    
    // Save to database
    await graph.save();
    console.log('✅ LoL champions graph saved successfully!');
    
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
