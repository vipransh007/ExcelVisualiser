// backend/scripts/seed_stress_level.js

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
const csvFilePath = path.resolve(__dirname, '../data/StressLevelDataset.csv');
const stressData = [];

// --- Database Connection and Seeding Logic ---
const seedStressLevel = async () => {
  if (!SEED_USER_ID || SEED_USER_ID === 'PASTE_A_REAL_USER_ID_FROM_YOUR_DATABASE_HERE') {
    console.error("ERROR: The SEED_USER_ID is still a placeholder. Please provide a real user ID.");
    return;
  }

  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("MongoDB Connected for Stress Level dataset...");

    // Read the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Filter out rows with missing data
        if (row.anxiety_level && row.stress_level && row.sleep_quality) {
          stressData.push({
            anxiety_level: parseInt(row.anxiety_level),
            stress_level: parseInt(row.stress_level),
            sleep_quality: parseInt(row.sleep_quality),
            depression: parseInt(row.depression),
            self_esteem: parseInt(row.self_esteem)
          });
        }
      })
      .on('end', async () => {
        console.log(`Finished reading Stress Level CSV. Found ${stressData.length} valid records.`);

        // Create scatter plot data for anxiety vs stress level
        const plotlyData = [
          {
            x: stressData.map(d => d.anxiety_level),
            y: stressData.map(d => d.stress_level),
            mode: 'markers',
            type: 'scatter',
            name: 'Anxiety vs Stress Level',
            marker: {
              color: stressData.map(d => d.sleep_quality),
              colorscale: 'Viridis',
              size: 8,
              colorbar: {
                title: 'Sleep Quality'
              }
            }
          }
        ];

        const graphObject = {
          name: 'Stress Level Analysis',
          description: 'Scatter plot showing anxiety level vs stress level, with sleep quality indicated by color intensity.',
          user: SEED_USER_ID,
          data: plotlyData,
          layout: {
            title: 'Stress Analysis: Anxiety vs Stress Level',
            xaxis: { title: 'Anxiety Level (0-30)' },
            yaxis: { title: 'Stress Level (0-2)' },
            showlegend: true
          }
        };

        // Insert the new graph object into the database
        await Graph.create(graphObject);
        console.log("Successfully seeded Stress Level scatter plot!");
        
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
      });
  } catch (error) {
    console.error("An error occurred:", error);
    await mongoose.connection.close();
  }
};

seedStressLevel();
