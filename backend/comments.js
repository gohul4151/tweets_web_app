const express = require('express');  
const { auth } = require('./auth');  
const { postModel } = require('./db');      
const { userModel } = require('./db');   
const { commentModel } = require('./db');
const { timeAgo }=require('./timeAgo');
const { mapComment } = require('./countcomment');

const router = express.Router();

router.post("/:id/comment", auth, async (req, res) => {
  const { text, parentCommentId } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  const comment = await commentModel.create({
    postId: req.params.id,
    userId: req.userId,
    text,
    parentCommentId: parentCommentId || null
  });

  if (!parentCommentId) {
    await postModel.findByIdAndUpdate(req.params.postId, {
      $inc: { commentCount: 1 }
    });
  }

  const enrichedComment = {
    ...comment._doc,
    isLiked: false,
    isDisliked: false,
    likesCount: 0,
    dislikesCount: 0,
    repliesCount: 0
  };

  res.json({ comment: enrichedComment });
});


router.get("/:id/comment", auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const comments = await commentModel
    .find({
      postId: req.params.id,
      parentCommentId: null
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name profile_url");

  const mappedComments = await Promise.all(
    comments.map(comment => mapComment(comment, req.userId))
  );

  res.json({ comments: mappedComments });
});





//GET /post/:id/comments?page=1;

module.exports = { commentRoute: router };
