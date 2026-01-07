import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from './app.js'
// import app from "./app.js"
// import {router} from "./routes/user.routers.js"
// import express from "express"

// const app = express();

dotenv.config({
    path: './env'
})


connectDB()
    .then(() => {
        // if server not able to connect
        app.on("error", (error) => {
            console.log("Error:", error);
            throw error;

        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);

        })


    })
    .catch((error) => {
        console.log("MongoDB connection FAILED !!", error);

    })

































/*
import express from "express";
const app = express();

(async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        app.on("error", (error)=>{
            console.log("Error:", error);
            throw error;
            
        })


        app.listen(process.env.PORT, ()=>{
            console.log("Your app is listening on port", process.env.PORT);
        })

    }catch(error){
        console.log("ERROR:", error);
        throw error;
        

    }

})();

*/