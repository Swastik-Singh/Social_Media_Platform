const { Types } = require("mongoose");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const async = require("async");
const { SECRET_KEY } = require("../config");
const { User } = require("../models");

const Controller = {};

Controller.authenticateUser = async ({ body }, res) => {
  const email = _.get(body, "email");
  const password = _.get(body, "password");
  try {
    const userWithEmail = await User.findOne({ email });

    if (!userWithEmail) {
      res.status(400).send(`No user found with email ${email}`);
      return;
    }

    const userPassword = _.get(userWithEmail, "password");
    if (password === userPassword) {
      const token = jwt.sign({ id: userWithEmail._id }, SECRET_KEY, {
        expiresIn: "24h",
      });
      res.status(200).send({
        msg: "Authorization Successful",
        token,
      });
    } else {
      res.status(400).send(`Invalid password`);
    }
  } catch (err) {
    const msg = `Error occurred during authentication for ${email}`;
    console.log(msg, err);
    res.status(500).send({ msg, err });
  }
};

Controller.followUser = async ({ params, user }, res) => {
  const followUserId = _.get(params, "id", "");
  const userId = _.get(user, "id", "");

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: followUserId },
      {
        $push: { followers: userId },
      },
      { new: true }
    );

    res.status(200).send(`You are now following ${updatedUser.userName}`);
  } catch (err) {
    const msg = `Error encountered during following user`;
    console.error(msg, `with id ${followUserId} requested by ${userId}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.unfollowUser = async ({ params, user }, res) => {
  const followUserId = _.get(params, "id", "");
  const userId = _.get(user, "id", "");

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: followUserId },
      {
        $pull: { followers: userId },
      },
      { new: true }
    );

    res
      .status(200)
      .send(`You have successfully unfollowed ${updatedUser.userName}`);
  } catch (err) {
    const msg = `Error encountered during un-following user`;
    console.error(msg, `with id ${followUserId} requested by ${userId}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.getUserDetails = async ({ user }, res) => {
  try {
    await async
      .parallel([
        async () => {
          const { userName, followers } = await User.findById(user.id);
          return { userName, followers: followers.length };
        },
        async () => {
          const followingsList = await User.find({
            followers: {
              $in: [Types.ObjectId(user.id)],
            },
          });
          return followingsList.length;
        },
      ])
      .then((results) => {
        const [{ userName, followers }, followings] = results;
        res.status(200).send({
          userName,
          followers,
          followings,
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    const msg = `Error encountered during fetching user details`;
    console.error(msg, `for id ${user.id}`, err);
    res.status(500).send({ msg, err });
  }
};

module.exports = Controller;
