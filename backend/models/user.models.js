import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Recommended for easier querying
        trim: true,      // Recommended to remove whitespace
        index: true      // Recommended for faster searches
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'] // Custom error message
    },
    avatar: { // Renamed from profilePicture to match the router
        type: String, // Stores the URL of the uploaded image
        // default: 'default.jpg' // You might not need a default if it's uploaded at registration
    },
    coverImage: { // Added to match the router
        type: String, // Stores the URL of the uploaded image
    },
    refreshToken: {
        type: String,
    },
}, {
    timestamps: true
});

// Pre-save hook for password hashing (example)
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

export const User = mongoose.model('User', userSchema);