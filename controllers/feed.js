// System / Package imports
import { validationResult } from "express-validator";
import Post from "../models/post.js";

//Get Post methods = GET
export const getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        id: "'1",
        title: "First Post",
        content: "This is the first post",
        imageUrl: "images/image.jpg",
        creator: { name: "Aamer" },
        createdAt: new Date(),
      },
    ],
  });
};

//Create Post Method = POST
export const createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }

  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/image.jpg",
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
