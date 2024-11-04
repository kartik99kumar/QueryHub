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

    const result = trendingQueries.map((entry) => ({
      query: entry.value,
      count: entry.score,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trending queries." });
  }
});

export { getTrendingQueries };
