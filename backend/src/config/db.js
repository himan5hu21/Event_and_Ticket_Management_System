import mongoose, { mongo } from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  try {
    const db = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ Database connected: ${db.connection.host}`);
    console.log(`✅ Database name: ${db.connection.name}`);
  } catch (err) {
    console.error(`❌ Failed to connect to database: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
