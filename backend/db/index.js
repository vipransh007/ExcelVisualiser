import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vipransh231527:Vipransh2315@cluster0.f0fl1.mongodb.net'
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
