const mongoose = require("mongoose");
const { commentModel } = require("./db");
const { userModel } = require("./db");              
const { postModel } = require("./db");


async function mapComment(comment, userId) {
  const repliesCount = await comment.constructor.countDocuments({
    parentCommentId: comment._id
  });

  return {
    ...comment._doc,

    // user-specific flags
    isLiked: comment.likes.includes(userId),
    isDisliked: comment.dislikes.includes(userId),

    // counts
    likesCount: comment.likes.length,
    dislikesCount: comment.dislikes.length,
    repliesCount
  };
}

module.exports = {mapComment};
