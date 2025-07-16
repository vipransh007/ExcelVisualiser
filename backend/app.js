import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();
app.use(cors(
    // need to allow credentials for cookie-based auth
));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


import userRoutes from './routes/userRoutes.js';

app.use("/api/v1/users", userRoutes);

export {app}