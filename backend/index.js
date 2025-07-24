import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import userRoutes from "./routes/userRoutes.js";
app.use("/api/v1/users", userRoutes);

// Configure environment variables
dotenv.config({
    path: './.env'
});

const port = 5000;

connectDB()
.then(() => {
    app.listen(port, () => {
        // This is the only log you need here.
        console.log(`✅ Server is running on port: ${port}`);
    });
})
.catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
});