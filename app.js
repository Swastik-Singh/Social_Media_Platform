const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { MONGO_URL } = require("./config");
const { authenticateRequest } = require("./middleware");
const { indexRouter, userMethods, postMethods } = require("./routes");

dotenv.config();

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URL || MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB for Social Media Connected..."))
  .catch((err) => console.log(err));

app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", indexRouter);
app.post("/api/authenticate", userMethods.authenticateUser);
app.post("/api/follow/:id", authenticateRequest, userMethods.followUser);
app.post("/api/unfollow/:id", authenticateRequest, userMethods.unfollowUser);
app.get("/api/user", authenticateRequest, userMethods.getUserDetails);
app.post("/api/posts", authenticateRequest, postMethods.createPost);
app.delete("/api/posts/:id", authenticateRequest, postMethods.deletePostById);
app.post("/api/like/:id", authenticateRequest, postMethods.likePost);
app.post("/api/unlike/:id", authenticateRequest, postMethods.unlikePost);
app.post("/api/comment/:id", authenticateRequest, postMethods.addCommentToPost);
app.get("/api/posts/:id", authenticateRequest, postMethods.getPostDetailsById);
app.get("/api/all_posts", authenticateRequest, postMethods.fetchAllPosts);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
