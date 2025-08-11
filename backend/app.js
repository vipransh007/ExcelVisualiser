import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// --- CORRECTED CORS CONFIGURATION ---
// The options object must be passed inside parentheses: cors({...})
app.use(cors({
    // This should be the address of your frontend application
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


import graphRouter from './routes/graphRouter.js';
import userRoutes from './routes/userRoutes.js';
app.use("/api/v1/graphs", graphRouter);

app.use("/api/v1/users", userRoutes);

export { app };
