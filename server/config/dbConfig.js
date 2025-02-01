import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: './.env'});

const connectToDb = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((error) => {
        console.log('Error connecting to database', error);
    });
}

export default connectToDb;