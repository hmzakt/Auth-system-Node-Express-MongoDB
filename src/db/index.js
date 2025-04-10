import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() =>{
    try{
        const fullUri = `${process.env.MONGODB_URI}?retryWrites=true&w=majority&appName=Cluster0/${process.env.DB_NAME}`;
    const connectionInstant=await mongoose.connect(fullUri)
    console.log(`\n mongoDB Connected !! DB HOST : ${connectionInstant.connection.host}"`)
    }
    catch(error){
        console.log("MongoDB connection error",error);
        process.exit(1)
    }
}
export default connectDB;