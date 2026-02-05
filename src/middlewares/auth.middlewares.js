import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log("Cookies:", req.cookies);

        // if (typeof req.cookies?.accessToken === "string") {
        //     token = req.cookies.accessToken;
        // } else if (req.headers.authorization?.startsWith("Bearer ")) {
        //     token = req.headers.authorization.split(" ")[1];
        // }
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log(`token : ${token}`);

        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access Token")
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Inside catch block");
        throw new ApiError(401, error?.message || "Invalid access token")

    }

})