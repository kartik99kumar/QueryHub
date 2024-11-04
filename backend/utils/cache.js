import { createClient } from "redis";

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
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
