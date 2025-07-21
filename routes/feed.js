//System / package import
import express from "express";
import { body } from "express-validator";

//local file methods etc imports
import {
  getPost,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/feed.js";
import { isAuthorized } from "../middleware/is-auth.js";

//instantiating objects or variables
const router = express.Router();

//main routes logic
//here using MVC patters so just calling the methods which are in the controller
router.get("/posts", isAuthorized, getPost);

router.post(
  "/post",
  isAuthorized,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

router.get("/post/:postId", getPostById);

router.put(
  "/post/:postId",
  isAuthorized,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost
);

router.delete("/post/:postId", isAuthorized, deletePost);

//exports
export { router as feedRoutes };
