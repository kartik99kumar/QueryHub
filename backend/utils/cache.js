import { createClient } from "redis";

const client = createClient({
  password: process.env.REDIS_PASSWORD || "b9VQ6HK5SAvJXLYuMgxjyBDx8zWpv1Yy",
  socket: {
    host:
      process.env.REDIS_HOST ||
      "redis-18062.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: process.env.REDIS_PORT || 18062,
  },
});

client.on("error", (error) => {
  console.error("Redis error:", error);
});

(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis server successfully.");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
})();

export default client;
