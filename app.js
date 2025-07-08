//System / package import
import express from "express";
import bodyParser from "body-parser";

//local file methods etc imports
import { feedRoutes } from "./routes/feed.js";

//instantiating objects or variables
const app = express();

//Parser middleware
app.use(bodyParser.json());

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

//listener
app.listen(8080);
