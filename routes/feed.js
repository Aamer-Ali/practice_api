import express from "express";
import { getPost, createPost } from "../controllers/feed.js";

const router = express.Router();

router.get("/posts", getPost);

router.post("/post", createPost);

export { router as feedRoutes };
