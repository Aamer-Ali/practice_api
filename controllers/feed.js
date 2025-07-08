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

export const createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

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
