// In your main index.js file

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// This MUST be the first line of code to run
dotenv.config({
    path: './.env'
});

const port = process.env.PORT ;

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`✅ Server is running on port: ${port}`);
    });
})
.catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
});