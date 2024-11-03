// This file does a cool thing as I have explained simply below:
// Idea: Various queries may have different texts but same meaning, so we use cohere ai here for
// another job, i.e. to get embeddings of the text and then compare the embeddings to get the
// similarity between the texts. This way we can group similar queries.

import axios from "axios";

// Get the embedding of a text using the Cohere API
async function getEmbedding(text) {
  const apiKey = process.env.COHERE_API_KEY;
  const endpoint = process.env.COHERE_EMBED_ENDPOINT;

  try {
    const response = await axios.post(
      endpoint,
      { texts: [text] },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.embeddings[0];
  } catch (error) {
    console.error(
      "Error fetching embedding:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch embedding.");
  }
}

// Calculate the cosine similarity between two vectors
// Not my idea but I have seen people use it to compare the embeddings.
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitudeA = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export { getEmbedding, cosineSimilarity };
