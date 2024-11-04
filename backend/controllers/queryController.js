import asyncHandler from "express-async-handler";
import axios from "axios";
import redisClient from "../utils/cache.js";
import { getEmbedding, cosineSimilarity } from "../utils/similarity.js";

// Perform a web search using the Brave Search API
// Returns an array of search results: { title, link, info }
const performWebSearch = asyncHandler(async (query) => {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  const endpoint = process.env.BRAVE_SEARCH_ENDPOINT;
  try {
    const response = await axios.get(endpoint, {
      headers: {
        "x-subscription-token": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: {
        q: query,
        count: 5,
      },
    });
    return response.data.web.results.map((result) => ({
      title: result.title,
      link: result.url,
      info: result.description,
    }));
  } catch (error) {
    if (error.response?.status == 429) {
      throw new Error(
        "Brave Search API Rate Limit Exceeded. Please try again later."
      );
    }
    throw new Error(
      "Failed to retrieve search results. Please check your query or try again."
    );
  }
});

// Generate an answer using the Cohere API
// Returns a summary of the search results
const generateAnswer = asyncHandler(async (query, searchResults) => {
  const apiKey = process.env.COHERE_API_KEY;
  const context = searchResults.map((result) => result.info).join("\n\n");
  const prompt = `Answer the query \"${query}\" using the context: \"${context}\"\n\n`;

  try {
    const response = await axios.post(
      process.env.COHERE_API_ENDPOINT,
      {
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.7,
        model: "command",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const summary = response.data.generations[0].text;
    if (!summary) {
      throw new Error("Failed to generate a response");
    }
    return summary.trim();
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error(
        "Cohere API Rate Limit Exceeded. Please try again later."
      );
    }
    throw new Error("Failed to generate an answer. Please try again.");
  }
});

// Find a similar query for a given query in Redis cache
// Returns the similar query if found, otherwise null
async function findSimilarQuery(query) {
  const threshold = 0.8; // we can adjust this for more or less strict similarity
  const queryEmbedding = await getEmbedding(query);
  const existingQueries = await redisClient.zRange("trendingQueries", 0, -1);

  for (const storedQuery of existingQueries) {
    const storedEmbedding = JSON.parse(
      await redisClient.get(`embedding:${storedQuery}`)
    );
    const similarity = cosineSimilarity(queryEmbedding, storedEmbedding);
    if (similarity >= threshold) {
      console.log("Found similar query:", storedQuery);
      return storedQuery;
    }
  }
  return null;
}

// Handle a query request
// Returns a response with the query, answer, and sources
const handleQuery = asyncHandler(async (req, res) => {
  const query = req.body.query;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const similarQuery = await findSimilarQuery(query);
  const trendingQuery = similarQuery || query; // Use the similar query if found
  await redisClient.zIncrBy("trendingQueries", 1, trendingQuery);

  if (!similarQuery) {
    const queryEmbedding = await getEmbedding(query);
    await redisClient.set(`embedding:${query}`, JSON.stringify(queryEmbedding));
  }

  const cachedResult = await redisClient.get(query);
  if (cachedResult) {
    return res.json({ answer: JSON.parse(cachedResult) });
  }

  try {
    const searchResults = await performWebSearch(query);
    const answer = await generateAnswer(query, searchResults);
    const sources = searchResults.map((result, index) => ({
      index: index,
      title: result.title,
      link: result.link,
    }));
    const response = { query: query, answer: answer, sources: sources };
    await redisClient.setEx(query, 3600, JSON.stringify(response));
    res.json({ answer: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { handleQuery };
