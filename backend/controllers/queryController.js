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
    console.error(
      "Error querying Brave Search API:",
      error.response?.data || error.message
    );
    if (error.response?.status == 429) {
      console.log("Rate Limit Exceeded");
      throw new Error(
        "Search API Rate Limit Exceeded. Please try again later."
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
  // Combine snippets from search results to form the context for the prompt
  const context = searchResults.map((result) => result.info).join("\n\n");
  //   console.log("Context:", context);
  const prompt = `Answer the query \"${query}\" using the context: \"${context}\"\n\n`;

  try {
    const response = await axios.post(
      process.env.COHERE_API_ENDPOINT || "https://api.cohere.ai/v2/generate",
      {
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.7, // using high value for more creative responses
        model: "command",
        // citation_options: "accurate", // not enough money to enable this ;_; will generate myself
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log("Generated Response:", response.data.generations[0].text);
    const summary = response.data.generations[0].text;
    if (!summary) {
      throw new Error("Failed to generate a response");
    }
    return summary.trim();
  } catch (error) {
    console.error(
      "Error querying Cohere API:",
      error.response?.data || error.message
    );
    if (error.response?.status === 429) {
      throw new Error(
        "Answer generation rate limit exceeded. Please try again later."
      );
    }
    throw new Error("Failed to generate an answer. Please try again.");
  }
});

// async function findOrStoreQuery(query) {
//   const threshold = 0.8; // Similarity threshold
//   const newQueryEmbedding = await getEmbedding(query);

//   // Retrieve all stored queries in Redis
//   const existingQueries = await redisClient.zRange("trendingQueries", 0, -1);

//   // Find the most similar query if it exists
//   for (const storedQuery of existingQueries) {
//     const storedEmbedding = JSON.parse(
//       await redisClient.get(`embedding:${storedQuery}`)
//     );
//     const similarity = cosineSimilarity(newQueryEmbedding, storedEmbedding);

//     if (similarity >= threshold) {
//       // Increment the count for the similar query
//       await redisClient.zIncrBy("trendingQueries", 1, storedQuery);
//       return storedQuery;
//     }
//   }

//   // If no similar query is found, store the new query with an initial count of 1
//   await redisClient.zAdd("trendingQueries", { score: 1, value: query });

//   // Store the embedding for future similarity checks
//   await redisClient.set(
//     `embedding:${query}`,
//     JSON.stringify(newQueryEmbedding)
//   );
//   return query;
// }
async function findSimilarQuery(query) {
  const threshold = 0.8;
  const queryEmbedding = await getEmbedding(query);

  // Retrieve all trending queries from Redis
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

  return null; // No similar query found
}

// Handle a query request
// Returns a response with the query, answer, and sources
const handleQuery = asyncHandler(async (req, res) => {
  const query = req.body.query;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // Normalize the query and check for similar queries
  const similarQuery = await findSimilarQuery(query);
  const trendingQuery = similarQuery || query; // Use the similar query if found

  // Increment the count for the similar query (or the current query if no match found)
  await redisClient.zIncrBy("trendingQueries", 1, trendingQuery);

  // Cache the embedding of the new query if no similar query was found
  if (!similarQuery) {
    const queryEmbedding = await getEmbedding(query);
    await redisClient.set(`embedding:${query}`, JSON.stringify(queryEmbedding));
  }

  const cachedResult = await redisClient.get(query);
  if (cachedResult) {
    console.log("Serving from Redis cache.");
    return res.json({ answer: JSON.parse(cachedResult) });
  }

  try {
    const searchResults = await performWebSearch(query);
    const answer = await generateAnswer(query, searchResults);
    const sources = searchResults.map(
      (result, index) => `${index + 1}. ${result.title}: ${result.link}`
    );
    const response = { query: query, answer: answer, sources: sources };
    await redisClient.setEx(query, 3600, JSON.stringify(response));
    res.json({ answer: response });
  } catch (error) {
    console.error("Error handling query:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export { handleQuery };
