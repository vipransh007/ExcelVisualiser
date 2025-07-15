import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import {asynchHandler} from '../utils/asynchHandler.js';

export const verifyJWT = asynchHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: " Unauthorized Request : authorization denied" });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id).select('-password -refreshToken');
        if (!user) {
            return res.status(401).json({ message: "Unauthorized Request : user not found" });
        }

        req.user = user;
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error);
        return res.status(403).json({ message: "Forbidden Request : invalid token" });
    }
});


