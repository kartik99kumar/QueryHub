import asyncHandler from "express-async-handler";
import redisClient from "../utils/cache.js";

const getTrendingQueries = asyncHandler(async (req, res) => {
  try {
    // Use ZREVRANGE with the native Redis command
    const trendingQueries = await redisClient.zRangeWithScores(
      "trendingQueries",
      0,
      9,
      { REV: true }
    );

    // Format the response as an array of objects with query and count
    const formattedTrending = trendingQueries.map((entry) => ({
      query: entry.value,
      count: entry.score,
    }));

    res.json(formattedTrending);
  } catch (error) {
    console.error("Error fetching trending queries:", error.message);
    res.status(500).json({ error: "Failed to fetch trending queries." });
  }
});

export { getTrendingQueries };
