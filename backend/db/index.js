import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {DB_NAME}from "../constanst.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
            console.log(`Database connected successfully to ${process.env.MONGO_URI}/${DB_NAME}`);
        }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);    
    }
};

export default connectDB;