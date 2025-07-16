import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
// import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";
// import { pipeline } from "stream";

const generateAccessAndRefreshToken = async(userId) =>
{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken ()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {refreshToken, accessToken};

        
    } catch (error) {
        res.status(500).json({message : "Something Went Wrong while generating refresh and access token"})

    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    console.log("email:", email);

    if ([fullName, email, username, password].some(field => !field?.trim())) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }]
    });
    if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log(avatarLocalPath);
    
    if (!avatarLocalPath) {
        return res.status(400).json({ message: "Avatar is required" });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar?.url) {
        return res.status(400).json({ message: "Avatar upload failed" });
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        return res.status(500).json({ message: "Something went wrong while registering the user" });
    }

    return res.status(201).json({
        message: "User registered successfully",
        user: createdUser
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email)) {
        return res.status(400).json({ message: "Fields are required" });
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        return res.status(404).json({ message: "User Does Not exist" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Email or Username does not exist" });
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { 
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            user: loggedInUser
        });
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshTokens: undefined
        }
    });

    const options = {
        httpOnly: true,
        secure: true
    };

    res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .status(200)
        .json({ message: "User Logged Out" });
});

const refreshAccessToken = asyncHandler(async(req, res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        res.status(401).json({message : "Unauthorized Token "})
    }
 try {
       const decodedToken = jwt.verify(incomingRefreshToken , 
           process.env.REFRESH_TOKEN_SECRET
       )
   
       const user = await User.findById(decodedToken?._id)
   
       if(!user){
           res.status(401).json({message: "Invalid Refresh Token "})
       }
       if(incomingRefreshToken !== user?.refreshTokens){
           res.status(401).json({message: "Token is Expired or used"})
       }
   
       const options = { 
           httpOnly : true,
           secure : true
       }
      const { newRefreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);
   
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
    res.status(401).json({message : error?.meesage || "Invalid Refresh Token "})
 }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        res.status(400).json({message : "Old Passowrd Does not Match"})
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).
    json({message: "Password Changed Successfully "});


})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        user: req.user,
        message: "Current user fetched successfully"
    });
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200).json({
        user,
        message: "Account details updated successfully"
    });
});

const updateUserAvatar = asyncHandler(async(req, res) =>{
    const avatarLocalPath = req.files?.path
    
    if(!avatarLocalPath){
        res.stauts(400).json({message: "Avatar File Is Missing"})
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        res.stauts(400).json({message: "Error While Updating On Avatar"})
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200).
    json({
        user : user,
        message: "Avatar Image Uploaded Successfully"
    })

})
const updateUserCoverImage = asyncHandler(async(req, res) =>{
    const CoverImageLocalPath = req.files?.path
    
    if(!avatarLocalPath){
        res.stauts(400).json({message: "Cover Image File Is Missing"})
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        res.stauts(400).json({message: "Error While Updating On Avatar"})
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200).
    json({
        user : user,
        message: "User Image Uploaded Successfully"
    })
})
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        return res.status(400).json({ message: "User Name is missing" });
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribeToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribeToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        return res.status(404).json({ message: "Channel does not exist" });
    }

    return res.status(200).json(channel[0]);
});

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from : "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                pipeline :[
                    {
                        $lookup: {
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",

                            pipeline : [
                                {
                                    $project: {
                                        fullName :1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])


return res.status(200).json({
  message: "Watch history fetched Successfully",
  watchHistory: user[0]?.watchHistory || []
  });
})


export {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateAccountDetails,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};