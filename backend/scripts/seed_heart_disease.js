// backend/scripts/seed_heart_disease.js

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
const csvFilePath = path.resolve(__dirname, '../data/data.csv');
const heartData = [];

// --- Database Connection and Seeding Logic ---
const seedHeartDisease = async () => {
  if (!SEED_USER_ID || SEED_USER_ID === 'PASTE_A_REAL_USER_ID_FROM_YOUR_DATABASE_HERE') {
    console.error("ERROR: The SEED_USER_ID is still a placeholder. Please provide a real user ID.");
    return;
  }

  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("MongoDB Connected for Heart Disease dataset...");

    // Read the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Filter out rows with missing data
        if (row.age && row.trestbps && row.chol && row.thalach) {
          heartData.push({
            age: parseInt(row.age),
            trestbps: parseInt(row.trestbps),
            chol: parseInt(row.chol),
            thalach: parseInt(row.thalach),
            sex: row.sex === '1' ? 'Male' : 'Female'
          });
        }
      })
      .on('end', async () => {
        console.log(`Finished reading Heart Disease CSV. Found ${heartData.length} valid records.`);

        // Create scatter plot data for age vs blood pressure
        const plotlyData = [
          {
            x: heartData.map(d => d.age),
            y: heartData.map(d => d.trestbps),
            mode: 'markers',
            type: 'scatter',
            name: 'Age vs Blood Pressure',
            marker: {
              color: heartData.map(d => d.sex === 'Male' ? 'blue' : 'red'),
              size: 8
            }
          }
        ];

        const graphObject = {
          name: 'Heart Disease Risk Factors',
          description: 'Scatter plot showing age vs blood pressure (systolic) with gender differentiation. Blue = Male, Red = Female.',
          user: SEED_USER_ID,
          data: plotlyData,
          layout: {
            title: 'Heart Disease Risk: Age vs Blood Pressure',
            xaxis: { title: 'Age (years)' },
            yaxis: { title: 'Blood Pressure (mm Hg)' },
            showlegend: true
          }
        };

        // Insert the new graph object into the database
        await Graph.create(graphObject);
        console.log("Successfully seeded Heart Disease scatter plot!");
        
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
      });
  } catch (error) {
    console.error("An error occurred:", error);
    await mongoose.connection.close();
  }
};

seedHeartDisease();
