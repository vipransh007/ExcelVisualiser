// backend/scripts/seed.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants.js';

// Import your Graph model (note the required .js extension)
import Graph from '../models/model.graphs.js';

// --- Replicating __dirname functionality in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- User ID ---
// This is the user ID you provided.
const SEED_USER_ID = '688871bf17e74c37c7187042';

// --- Configuration ---
const csvFilePath = path.resolve(__dirname, '../data/penguins.csv');
const graphsToSeed = [];

// --- Database Connection and Seeding Logic ---
const seedDatabase = async () => {
  // A check to ensure the ID isn't a placeholder (Good practice)
  if (!SEED_USER_ID || SEED_USER_ID === 'PASTE_A_REAL_USER_ID_FROM_YOUR_DATABASE_HERE') {
    console.error("ERROR: The SEED_USER_ID is still a placeholder. Please provide a real user ID.");
    return;
  }

  try {
     await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("MongoDB Connected...");

    // This stream reads the CSV file line by line
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // This function is called for every row in the CSV.
        // We will create one big scatter plot from all the penguin data.
        // We only process rows that have the necessary data.
        if (row.bill_length_mm && row.bill_depth_mm) {
          graphsToSeed.push({
            species: row.species,
            bill_length_mm: parseFloat(row.bill_length_mm),
            bill_depth_mm: parseFloat(row.bill_depth_mm),
          });
        }
      })
      .on('end', async () => {
        // This function is called when the entire CSV has been read.
        console.log(`Finished reading CSV. Found ${graphsToSeed.length} valid penguin records.`);

        // Now, we format the collected data into a Plotly graph object.
        // We will create one scatter plot with a different "trace" for each species.
        const species = [...new Set(graphsToSeed.map(p => p.species))]; // Get unique species
        
        const plotlyData = species.map(s => {
          const speciesData = graphsToSeed.filter(p => p.species === s);
          return {
            x: speciesData.map(p => p.bill_length_mm),
            y: speciesData.map(p => p.bill_depth_mm),
            mode: 'markers',
            type: 'scatter',
            name: s, // The legend will show the species name
          };
        });
        
        const graphObject = {
            name: 'Penguin Bill Dimensions',
            description: 'A scatter plot showing bill length vs. bill depth for three penguin species.',
            user: SEED_USER_ID,
            data: plotlyData,
            layout: {
                title: 'Palmer Penguins: Bill Length vs. Depth',
                xaxis: { title: 'Bill Length (mm)' },
                yaxis: { title: 'Bill Depth (mm)' },
            }
        };

        // Clear all previous graphs for this specific user to avoid duplicates
        await Graph.deleteMany({ user: SEED_USER_ID });
        console.log("Cleared old seeded graphs for the user.");
        
        // Insert the new graph object into the database
        await Graph.create(graphObject);
        console.log("Successfully seeded the database with the Penguins scatter plot!");
        
        // Disconnect from the database
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
      });
  } catch (error) {
    console.error("An error occurred:", error);
    await mongoose.connection.close();
  }
};

seedDatabase();
