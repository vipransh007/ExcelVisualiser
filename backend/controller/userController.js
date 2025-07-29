import asynchHandler from "../utils/asynchHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import multer from "multer";
const upload = multer();

const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const registerUser = asynchHandler(async (req, res) => {
    const { email, username, password } = req.body;
    
    if ([email, username, password].some((field) => !field?.trim())) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }]
    });
    if (existingUser) {
        return res.status(409).json({ message: "User with email or username already exists" });
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) {
        return res.status(400).json({ message: "Avatar file is required" });
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    if (!avatar) {
        return res.status(400).json({ message: "Avatar file failed to upload" });
    }
    const user = await User.create({
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        return res.status(500).json({ message: "Something went wrong while registering the user" });
    }
    return res.status(201).json({
        user: createdUser,
        message: "User registered successfully"
    });
});

const loginUser = asynchHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        return res.status(400).json({ message: "Username or email is required" });
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (!user) {
        return res.status(404).json({ message: "User does not exist" });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid user credentials" });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            user: loggedInUser,
            accessToken,
            refreshToken,
            message: "User logged in successfully"
        });
});

const logoutUser = asynchHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "User logged out successfully" });
});

const refreshAccessToken = asynchHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        return res.status(401).json({ message: "Unauthorized request" });
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({ message: "Refresh token is expired or used" });
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                accessToken,
                refreshToken: newRefreshToken,
                message: "Access token refreshed"
            });
    } catch (error) {
        return res.status(401).json({ message: error?.message || "Invalid refresh token" });
    }
});

const changeCurrentPassword = asynchHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id).select('+password');
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid old password" });
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: true });
    return res.status(200).json({ message: "Password changed successfully" });
});

const getCurrentUser = asynchHandler(async (req, res) => {
    return res.status(200).json({
        user: req.user,
        message: "Current user fetched successfully"
    });
});

const updateAccountDetails = asynchHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        return res.status(400).json({ message: "Full name and email are required" });
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password");
    return res.status(200).json({
        user,
        message: "Account details updated successfully"
    });
});

const updateUserAvatar = asynchHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        return res.status(400).json({ message: "Avatar file is missing" });
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        return res.status(400).json({ message: "Error while uploading avatar" });
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");
    return res.status(200).json({
        user,
        message: "Avatar image updated successfully"
    });
});

const updateUserCoverImage = asynchHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        return res.status(400).json({ message: "Cover image file is missing" });
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        return res.status(400).json({ message: "Error while uploading cover image" });
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password");
    return res.status(200).json({
        user,
        message: "Cover image updated successfully"
    });
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};