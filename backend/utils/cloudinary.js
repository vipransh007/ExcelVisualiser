import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { unlink } from 'fs/promises';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dy00glstf', 
    api_key: process.env.CLOUDINARY_API_KEY || '993234272763225', 
    api_secret: process.env.CLOUDINARY_API_SECRET || '6tNJACf9VfZEQI89ghwF07vSUmQ'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath)
        // console.log("file has been uploaded", response.secure_url);
        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if(fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); 
        }
        return null;
    }
}

export { uploadOnCloudinary }