import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
         type: String, 
         required: true,
          unique: true
         },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    profilePicture: {
         type: String, default: 'default.jpg'
        },
        refreshToken: {
        type: String,
    },
    // uploadHistory: [{ 
    //     type: mongoose.Schema.Types.ObjectId, ref: 'Upload' 
    // }],
}, {
    timestamps: true
});

export const User = mongoose.model('User', userSchema);