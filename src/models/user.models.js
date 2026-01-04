import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,

        },
        fullname: {
            type: String,
            required: true,
            index: true,
            trim: true,

        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String,

        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }


    },
    { timestamps: true }
)

userSchema.pre("save",async function(next){
    //the bcrypt takes two parameters
    //  i) field to bcrypt
    //  ii) No. of round to add salt(extra characters to enbrypt the original password )
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next()


})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = async function(){
    //THe jwt.sing(): takes three parameters: it returns the generatd token the Web token
    //  i) the fields you want to keep
    //  ii) the access token string
    //  iii) the expiry time of access token
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function(){
    //THe jwt.sing(): takes three parameters: it returns the generatd token the Web token
    //  i) the fields you want to keep
    //  ii) the refresh token string
    //  iii) the expiry time of refesh token
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SCRETE,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)