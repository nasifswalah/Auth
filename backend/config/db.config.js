import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (req, res) => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error connection to MongoDB: ${error.message}`);
        process.exit(1)
    };
};

export default connectDB;