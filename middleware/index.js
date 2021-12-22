const _ = require("lodash");
const jwt = require("jsonwebtoken");

const authenticateRequest = async (req, res, next) => {
  const token = _.get(req.headers, "authorization", '');

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        res.status(400).send("Authentication token is invalid");
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(400).send("Authentication token is missing");
  }
};

module.exports = { authenticateRequest };
