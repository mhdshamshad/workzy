import { createClient } from "redis";

import { REDIS_URL } from "@/constants";

import logger from "./logger";

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Error: ", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    logger.info("Connected to Redis!");
  }
};

export default redisClient;
