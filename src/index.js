// require('dotenv').config({path : './env'})
import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})

import connectDB from "./db/index.js"
import { app } from "./app.js"

// app.listen(process.env.PORT || 8000, () => {
//     console.log(`Server is started at port ${process.env.PORT}`)
// })

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is started at port ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("dbConnection error \n", err)
    })





















// import express from "express"

// const app = express()
// // try catch me wrap karo already when using database
// //database se baat karo async await lagao

// (async ()=>{
// try{
//    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//    app.on("error",(err)=>{
//     console.log("Error : ",err)
//     throw err
//    })
//    app.listen(process.env.PORT(),()=>{
//     console.log(`Server started on PORT :  ${process.env.PORT}`);
// })
// }

// catch (error){
//     console.error("ERROR : ", error)
//     throw error;
// }
// })()