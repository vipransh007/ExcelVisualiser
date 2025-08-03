import dotenv from "dotenv";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cors(
    // need to allow credentials for cookie-based auth
));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


import graphRouter from './routes/graphRouter.js';
import userRoutes from './routes/userRoutes.js';
app.use("/api/v1/graphs", graphRouter);

app.use("/api/v1/users", userRoutes);

export {app}