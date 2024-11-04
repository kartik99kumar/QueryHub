import express from "express";
import { getTrendingQueries } from "../controllers/trendingController.js";

const router = express.Router();
router.get("/", getTrendingQueries);

export default router;
