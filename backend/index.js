import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";
import {app} from "./app.js"

// Configure environment variables

dotenv.config({path: "./.env"});

connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () => {

    console.log(`Server is running on port ${process.env.PORT || 5000}`);         
    console.log("Database connected successfully");
    });
      
}).catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
});