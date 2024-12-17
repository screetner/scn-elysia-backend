import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL || "");

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
  process.exit(1); // Terminate the process
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully!");
});
