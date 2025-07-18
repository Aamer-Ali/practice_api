//System / package import
import express from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";

//local file import
import User from "../models/user.js";

//Variable and object
const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("please enter valid email")
      //Here for validation in custom I have used async await instead of promise.
      //No matter what use use be sure every thing is working fine and use exception handling properly.
      .custom(async (value) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("Email");
        }
      })
      .normalizeEmail(),
    body("password").trim().isEmpty(),
    body("name").trim().isEmpty(),
  ],
  async (req, res, next) => {
    /** Error Handling */
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      const error = Error("Please enter valid data");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    /** Extracting the data */
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    /** Encrypting the data
     * All here I omit he Promises and used the async/await
     * This is modern one & I am very much familiar with this
     * Other can use what ever they want.
     */
    try {
      const hashedPassword = await hash(password, 12);
      const user = new User({
        email: email,
        name: name,
        password: hashedPassword,
      });
      const savedData = await user.save();
      if (savedData) {
        res
          .status(201)
          .json({ message: "User Added successfully", userId: savedData._id });
      }
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
        next(error);
      }
    }
  }
);

router.post("/login", async (req, res, next) => {
  //Extract Data
  const email = req.body.email;
  const password = req.body.password;

  try {
    //Check user in data base
    const userFormDb = await User.findOne({ email: email });

    //No user through the error
    if (!userFormDb) {
      const error = new Error("Usr not found with this email id");
      error.statusCode = 404;
      throw error;
    }

    //If user present Match the password
    const isPasswordMatch = await compare(password, userFormDb.password);
    //If password did not match through the error
    if (!isPasswordMatch) {
      const error = new Error("Password is in correct");
      error.statusCode = 401;
      throw error;
    }
    //If password matched create one token
    const token = jwt.sign(
      {
        email: userFormDb.email,
        userId: userFormDb._id.toString(),
      },
      "some-secret-key",
      { expiresIn: "1h" }
    );
    //Send the token with the data you want.
    res.status(200).json({ token: token, userId: userFormDb._id.toString() });
  } catch (error) {
    //Global Error
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

export { router as authRoutes };
