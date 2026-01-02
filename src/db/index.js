import mongoose from "mongoose"


const connectDB = async () => {
    try {
        const dbConnectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Conncted !! DB Host : ${dbConnectionInstance}`);
        
        
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
}


export default connectDB