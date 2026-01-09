import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsomwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // addinf refesh token to data base and saving it
        user.refreshToken = refreshToken;

        // we use validateBeforeSave function to save withoud kicking the password field
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }



    } catch (error) {
        throw new ApiError(500, "Some went wrong while generating refresh ans access token")

    }
}

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "Backend On chai aur Code..."
    // })
    // steps to register user
    // 1. get user detail
    // 2. verify the all required field
    // 3. check user already exist: username , email
    // 4. check for image , check for avatar
    // 5. upload on cloudinary
    // 6. create user object - create entry in db
    // 7. remove paddord and refresh token field from response
    // 8. check for user creation 
    // 9. return response



    const { fullname, email, username, password } = req.body;
    // console.log("Email: ", email);
    // console.log("fullname: ", fullname);
    // console.log("password: ", password);
    // console.log("username: ", username);
    if (
        [fullname, email, username, password].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "All fields are compulsary")
    }



    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })


    if (existedUser) {
        throw new ApiError(409, "User Already Exists")
    }



    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log("FILES RECEIVED:", req.files);
    // // console.log("REQ.FILES =", req.files);
    // console.log("AVATAR =", req.files?.avatar);
    // console.log("AVATAR[0] =", req.files?.avatar?.[0]);
    console.log("AVATAR PATH =", req.files?.avatar?.[0]?.path);
    // console.log("FILE OBJECT =", req.files?.avatar?.[0]);

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }



    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required first messgae ")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("Data uploaded succesfully");



    if (!avatar) {
        throw new ApiError(400, "Avatar image is required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    console.log("log after user creation");

    const createdUser = await User.findById(user._id).select(
        // it returns the fields except those fields that is  inside the string
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    //req body => data
    // username or email
    // find user
    // check password
    //acces and refresh token generate and send to user
    // send tokens as cookie,
    // response : user logged in

    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or email is required.")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]

    })
    if (!existedUser) {
        throw new ApiError(404, "User doesnot Exists");
    }
    const isPasswordValid = await existedUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);
    const loggedInUser = await User.findById(existedUser._id).
        select("-password -refreshToken");

    // sending cookie

    const options = {
        httpOnly: true,
        secure: true

    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully..👍"
            )
        )
})

// Still to fixed the logout issue;
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true

    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out successfully"))



})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = refreshAccessToken.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")

    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SCRETE)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")

        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token  is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access token is refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid token ")

    }
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken

}