import express from "express";
import { getTrendingQueries } from "../controllers/trendingController.js";

const router = express.Router();

// Endpoint to get trending queries
router.get("/", getTrendingQueries);

export default router;
