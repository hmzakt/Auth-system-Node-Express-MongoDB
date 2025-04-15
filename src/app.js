import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express()

// app.use(cors())

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*", // Add fallback
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Explicitly allow methods
}))




app.use(express.json({
    limit: "20kb"
}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter);

 // /users is used as a prefix and further we can add more routes under userRoute 
export {app};