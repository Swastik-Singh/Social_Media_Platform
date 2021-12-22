const _ = require("lodash");
const { Post } = require("../models");

const Controller = {};

Controller.createPost = async ({ body, user }, res) => {
  const payload = {
    ...body,
    author: user.id,
  };

  try {
    const { _id, title, description, createdAt } = await Post.create(payload);

    res.status(200).send({ id: _id, title, description, createdAt });
  } catch (err) {
    const msg = `Error occurred during creating post`;
    console.log(msg, `with ${body} requested by ${user.id}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.likePost = async ({ params, user }, res) => {
  const postId = _.get(params, "id", "");
  const userId = _.get(user, "id", "");

  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $push: { likes: userId },
      },
      { new: true }
    );

    res.status(200).send(`You have liked the post "${updatedPost.title}"`);
  } catch (err) {
    const msg = `Error encountered during liking post`;
    console.error(msg, postId, ` requested by ${userId}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.unlikePost = async ({ params, user }, res) => {
  const postId = _.get(params, "id", "");
  const userId = _.get(user, "id", "");

  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $pull: { likes: userId },
      },
      { new: true }
    );

    res
      .status(200)
      .send(`You have successfully unliked "${updatedPost.title}"`);
  } catch (err) {
    const msg = `Error encountered during unliking post`;
    console.error(msg, postId, ` requested by ${userId}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.addCommentToPost = async ({ params, body, user }, res) => {
  const postId = _.get(params, "id", "");
  const comment = _.get(body, "comment", "");
  const authorId = _.get(user, "id", "");

  try {
    const payload = {
      authorId,
      comment,
    };
    const updatedPost = await Post.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $push: { comments: payload },
      },
      {
        new: true,
      }
    );

    const comments = updatedPost?.comments;
    const commentId = comments[comments.length - 1]._id;

    res.status(200).send({ commentId });
  } catch (err) {
    const msg = `Error encountered during commenting on post`;
    console.error(msg, postId, `with comment ${comment} requested by ${authorId}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.getPostDetailsById = async ({ params, user }, res) => {
  const postId = _.get(params, "id", "");

  try {
    const { _id, title, description, likes, comments } = await Post.findById(
      postId
    );

    res.status(200).send({
      _id,
      title,
      description,
      likes: likes.length,
      comments: comments.length,
    });
  } catch (err) {
    const msg = `Error encountered during fetching post details`;
    console.error(msg, ` for ${postId} requested by ${user.id}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.fetchAllPosts = async ({ user }, res) => {
  try {
    const foundPosts = await Post.find({
      author: user.id,
    }).sort([["createdAt", "asc"]]);
    const postsList = foundPosts.map(
      ({ _id, title, description, createdAt, likes, comments }) => {
        return {
          id: _id,
          title,
          desc: description,
          createdAt,
          likes: likes.length,
          comments: comments.map(({comment}) => comment),
        };
      }
    );
    res.status(200).send(postsList);
  } catch (err) {
    const msg = `Error encountered during fetching posts lists`;
    console.error(msg, ` created by ${user.id}`, err);
    res.status(500).send({ msg, err });
  }
};

Controller.deletePostById = async ({ params, user }, res) => {
  const postId = _.get(params, "id", "");

  try {
    await Post.findByIdAndDelete(postId);
    res.status(200).send(`Selected post has been deleted successfully`);
  } catch (err) {
    const msg = `Error encountered during deleting post`;
    console.error(msg, postId, ` requested by ${user.id}`, err);
    res.status(500).send({ msg, err });
  }
};

module.exports = Controller;
