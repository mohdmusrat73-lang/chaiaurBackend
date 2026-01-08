import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
    console.log("Email: ", email);
    if (
        [fullname, email, username, password].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "All fields are compulsary")
    }

    const existedUser = User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "User Already Exists")
    }

    const avatrLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatrLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }
    const avatar = await uploadOnCloudinary(avatrLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
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
    const createdUser = await user.findById(user._id).select(
        // it returns the fields except those fields that is  inside the string
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export { registerUser }