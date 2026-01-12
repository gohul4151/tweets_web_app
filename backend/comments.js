const express = require('express');  
const { auth } = require('./auth');  
const { postModel } = require('./db');      
const { userModel } = require('./db');   
const { commentModel } = require('./db');
const { timeAgo }=require('./timeAgo');

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { text, parentCommentId } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  const comment = await commentModel.create({
    postId: req.params.postId,
    userId: req.user.id,
    text,
    parentCommentId: parentCommentId || null
  });

  if (!parentCommentId) {
    await postModel.findByIdAndUpdate(req.params.postId, {
      $inc: { commentCount: 1 }
    });
  }

  res.json({ comment });
});


router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const comments = await commentModel
    .find({
      postId: req.params.postId,
      parentCommentId: null
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name profile_url");

  res.json({ comments });
});

router.get("/comment/:commentId/replies", async (req, res) => {
  const replies = await commentModel
    .find({ parentCommentId: req.params.commentId })
    .sort({ createdAt: 1 })
    .populate("userId", "name profile_url");

  res.json({ replies });
});


//GET /post/:id/comments?page=1;

module.exports = { commentRoute: router };
