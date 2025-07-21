import jwt from "jsonwebtoken";

export const isAuthorized = (req, res, next) => {
  let decodedToken;
  //Extract AuthToken
  const authToken = req.get("Authorization");
  //check if auth token exists
  if (!authToken) {
    //Throw and error
    const error = new Error("Authorization Failed");
    error.statusCode = 401;
    throw error;
  }
  const token = authToken.split(" ")[1];

  try {
    decodedToken = jwt.verify(token, "some-secret-key");

    if (!decodedToken) {
      const error = new Error("Authorization Failed");
      error.statusCode = 401;
      throw error;
    }
    console.log(decodedToken);

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
