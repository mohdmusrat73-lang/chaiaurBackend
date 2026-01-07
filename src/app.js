import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"



const app = express();

app.use((req, res, next) => {
    console.log("Incoming request: ", req.method, req.url);
    next();

});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "20kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "20kb"
}))

app.use(express.static("public"))
app.use(cookieParser())

// routes

import userRouter from './routes/user.routes.js';


// route

app.use("/api/v1/users", userRouter);

// app.post("/register", (req,res)=>{
//     res.status(200).send({
//         message: "Ok meesgae got"
//     })
// })

console.log(userRouter);




// the uri like this http://localhost:8000/api/v1/users/register




export { app }

