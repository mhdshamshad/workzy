import mongoose from "mongoose";

import { MONGO_URI } from "@/constants";

import logger from "./logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI || "", {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
