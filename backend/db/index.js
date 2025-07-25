import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
import path from "path";
import { log } from "console";

dotenv.config({
    path: './.env'
});

// const port = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    console.log(`MongoDB connected successfully! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
