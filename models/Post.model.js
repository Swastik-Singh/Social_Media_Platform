const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    title: String,
    description: {
      type: String,
      unique: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        postId: {
          type: Schema.Types.ObjectId,
          ref: "Post",
        },
        authorId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = model("Post", postSchema);

module.exports = Post;
