import express from "express";
const router = express.Router();
import { handleQuery } from "../controllers/queryController.js";
router.post("/", handleQuery);

export default router;
