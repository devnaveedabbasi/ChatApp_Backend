import mongoose from "mongoose";

const connectDb=async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log('mongoDb connect succesfully')
    } catch (error) {
        console.log("MongoDB connection Failed:", error.message);
        process.exit(1);
    }
}

export default connectDb