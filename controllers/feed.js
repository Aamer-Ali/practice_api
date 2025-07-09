// System / Package imports
import { validationResult } from "express-validator";
import Post from "../models/post.js";

//Get Post methods = GET
export const getPost = (req, res, next) => {
  Post.find()
    .then((result) => {
      res.status(200).json({
        message: "Post Fetched Success",
        posts: result,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next();
    });
};

//Create Post Method = POST
export const createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  console.log(req.file);

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
    creator: { name: "Aamer Ali" },
  });
  //create a post in db
  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next();
    });
};

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
      next();
    });
};

export const updatePost = (req, res, next) => {
  const postId = req.params.postId;

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

  Post.findById(postId)
    .then((result) => {
      if (!result) {
        const error = new Error("No post with this post id found");
        error.statusCode = 404;
        throw error;
      }
      result.title = title;
      result.content = content;
      result.imageUrl = imageUrl;
      return result.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post Updated!", post: result });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
        next();
      }
    });
};
