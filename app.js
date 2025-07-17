//System / package import
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";

//local file methods etc imports
import { feedRoutes } from "./routes/feed.js";
import { authRoutes } from "./routes/auth.js";

//instantiating objects or variables
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "images");
  },
  filename: (req, file, callBack) => {
    callBack(null, new Date() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, callBack) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callBack(null, true);
  } else {
    callBack(null, false);
  }
};

//Parser middleware
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

//CORS
//Every Request or Response we have this applied to all of them
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Instead of * you can lock the access to a particular domain like something.com
  // So only something.com has access to this other than that no domain can access that.
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  //You can only allow what you want no need to allow all.
  res.setHeader("Access-Control-Allow-Header", "Content-Type, Authorization");
  //You can also Use * here as a wildcard so all header will be allowed
  next();
});

//routes
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

//General Error handling functionality
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

//Stablish connection to data-base ( Mongoose )
mongoose
  .connect(
    "mongodb+srv://sayyedaamerali:Yub3u9ixmaKqYXqt@cluster0.opaz9ov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((result) => {
    console.log(
      "******** Database connected and server is started and functioning as expected."
    );

    app.listen(8080);
  })
  .catch((error) => console.log(error));
