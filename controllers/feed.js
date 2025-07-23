// System / Package imports
import { validationResult } from "express-validator";
import Post from "../models/post.js";
import User from "../models/user.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

//Const and variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Get Post methods = GET
export const getPost = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = req.query.perPage || 2;
  let totalItemsCount;
  Post.find()
    .countDocuments()
    .then((itemCount) => {
      totalItemsCount = itemCount;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.json({
        message: "Fetched Post",
        posts: posts,
        totalItemsCount: totalItemsCount,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
//Create Post Method = POST
export const createPost = async (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  let userId = req.userId;

  // console.log(req.file);

  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image Provided");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: userId,
  });
  //create a post in db
  try {
    const savedPost = await post.save();

    const loggedInUser = await User.findById(userId);

    loggedInUser.posts.push(post);
    const savedLoggedInUser = await loggedInUser.save();

    /** Here we can add more validations and error handling to check every time that the
     * Post is saved and is there a loggedInUser and also the data is pushed to user and Saved that
     */

    res.status(201).json({
      message: "Post created successfully",
      post: post,
      creator: {
        _id: savedLoggedInUser._id,
        name: savedLoggedInUser.name,
      },
    });
  } catch {
    (error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    };
  }
};

//Get posts by Id method = GET
export const getPostById = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((result) => {
      if (!result) {
        const error = new Error("The record for this Id is not found...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post Fetched", post: result });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

// Update Post method = PUT
export const updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new Error("Validation Failed..");
    error.statusCode = 422;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No File found");
    error.statusCode = 422;
    throw error;
  }

  try {
    const selectedPost = await Post.findById(postId);
    if (!selectedPost) {
      const error = new Error("No post with this post id found");
      error.statusCode = 404;
      throw error;
    }
    console.log(selectedPost.creator.toString());
    console.log(userId);

    if (selectedPost.creator.toString() !== userId.toString()) {
      const error = new Error(
        "User not is authorized user to make changes in the post"
      );
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== selectedPost.imageUrl) {
      clearImage(selectedPost.imageUrl);
    }
    selectedPost.title = title;
    selectedPost.content = content;
    selectedPost.imageUrl = imageUrl;
    const savedPost = await selectedPost.save();
    res.status(200).json({ message: "Post Updated!", post: savedPost });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

//Delete post method = DELETE
export const deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;

  try {
    const selectedPost = await Post.findById(postId);
    if (!selectedPost) {
      const error = new Error("No post with this post id found");
      error.statusCode = 404;
      throw error;
    }
    if (selectedPost.creator.toString() !== userId.toString()) {
      const error = new Error("User not is authorized user to delete the post");
      error.statusCode = 403;
      throw error;
    }
    // clearImage(selectedPost.imageUrl);
    await Post.findByIdAndDelete(postId);
    const selectedUser = await User.findById(userId);
    selectedUser.posts.pop(postId);
    await selectedUser.save();
    res.status(200).json({ message: "The Post is deleted..." });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

//Clear image while updating or deleting the post
const clearImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  fs.unlink(fullPath, (err) => console.log("Error is ", err));
};
