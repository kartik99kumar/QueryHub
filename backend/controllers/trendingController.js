import asyncHandler from "express-async-handler";
import redisClient from "../utils/cache.js";

// gets the top 5 trending queries from Redis
const getTrendingQueries = asyncHandler(async (req, res) => {
  try {
    const trendingQueries = await redisClient.zRangeWithScores(
      "trendingQueries",
      0,
      4,
      { REV: true }
    );
    const result = await Promise.all(
      trendingQueries.map(async (entry) => {
        const cachedResponse = await redisClient.get(entry.value);
        return {
          query: entry.value,
          count: entry.score,
          response: cachedResponse ? JSON.parse(cachedResponse) : null,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trending queries." });
  }
});

export { getTrendingQueries };
