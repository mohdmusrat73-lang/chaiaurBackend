import mongoose from "mongoose"

import { DB_NAME } from "../constant.js"
const connectDB = async () => {
    try {
        const dbConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB Conncted !! DB Host : ${dbConnectionInstance}`);
        
        
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
}


export default connectDB