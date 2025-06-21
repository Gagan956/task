import mongoose from "mongoose";


export const connectDB = async () : Promise<void>=> {
    try {
       const connection =  await mongoose.connect(process.env.MONGO_URI as string, )
        console.log(`Connected to MongoDB :  ${connection.connection.host}`);
    } catch (error) {
        console.log("Error connecting to MongoDB: ", error);
        process.exit(1);
        
    }
}