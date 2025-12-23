const express = require('express');
const {auth} =require('./auth');
const {postModel}=require('./db');
const {userModel}=require('./db');
const { timeAgo }=require('./timeAgo');

const router = express.Router();



router.get("/getmypost",auth,async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    res.json({totalPosts:user.post_ids.length});
    
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
  
    const posts = await postModel
      .find({ _id: { $in: user.post_ids } })
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit);

    const modifiedPosts = posts.map(post => ({
      ...post._doc,
      isLiked: post.likes.includes(req.userId),
      isDisliked: post.dislikes.includes(req.userId),
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      timeAgo: timeAgo(post.time), // function to convert time to "time ago" format
    }));

    res.json({ posts: modifiedPosts });

  } catch (err) {
    res.status(500).json({ message: "Failed to load your posts" });
  }
});

module.exports = { myPostRoute: router };
