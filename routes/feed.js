//System / package import
import express from "express";

//local file methods etc imports
import { getPost, createPost } from "../controllers/feed.js";

//instantiating objects or variables
const router = express.Router();

//main routes logic
//here using MVC patters so just calling the methods which are in the controller
router.get("/posts", getPost);

router.post("/post", createPost);

//exports
export { router as feedRoutes };
