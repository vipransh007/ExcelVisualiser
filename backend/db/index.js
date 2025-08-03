import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
import path from "path";

// --- The Fix is Here ---
// This correctly finds the .env file in the parent directory (the 'backend' folder)
// regardless of where this script is called from.
dotenv.config({ path: path.resolve('../.env') });


const connectDB = async () => {
  try {
    // Check if the URI is loaded correctly
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables. Make sure your .env file is configured correctly.");
    }
    
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`✅ MongoDB connected successfully! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
