const express = require("express");
const indexRouter = express.Router();
const userMethods = require("./User.routes");
const postMethods = require("./Post.routes");

indexRouter.get("/", function (_, res) {
  res.status(200).send("Social Media Backend Server Active");
});

module.exports = { indexRouter, userMethods, postMethods };
