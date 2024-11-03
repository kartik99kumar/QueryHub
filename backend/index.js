import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

const PORT = process.env.PORT || 3000;
import queryRouter from "./routes/query.js";
import trendingRouter from "./routes/trending.js";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Response from server");
});

app.use("/query", queryRouter);
app.use("/trending", trendingRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
