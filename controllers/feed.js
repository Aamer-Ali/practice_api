// System / Package imports
import { validationResult } from "express-validator";

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
    return res.status(422).json({
      message: "Validation Failed",
      error: error.array(),
    });
  }
  //create a post in db
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: { name: "Aamer Ali" },
      createdAt: new Date(),
    },
  });
};
