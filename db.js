const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();
const connectDB=async ()=>{
    try {
        const db = await mongoose.connect(
          process.env.MONGO_URI
        );
        console.log(`successfull connection to DB`)
    } catch (error) {
         console.error("MongoDB connection error:", error.message);
         process.exit(1);
    }
}
module.exports=connectDB;