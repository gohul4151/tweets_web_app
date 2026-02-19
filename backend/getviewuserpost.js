const express = require('express');
const { auth } = require('./auth');
const { postModel } = require('./db');
const { userModel } = require('./db');
const { timeAgo } = require('./timeAgo');

const router = express.Router({ mergeParams: true });

router.get("/", auth, async (req, res) => {
  try {
    const viewuser = req.params.name.trim();
    const user = await userModel.findOne({ name: { $regex: new RegExp(`^\\s*${viewuser}\\s*$`, 'i') } });
    if (!user) {
      return res.status(404).json({ message: "User not found", posts: [] });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await postModel
      .find({ _id: { $in: user.post_ids } })
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name profile_url");

    const modifiedPosts = posts.map(post => ({
      ...post._doc,
      isLiked: post.likes.includes(req.userId),
      isDisliked: post.dislikes.includes(req.userId),
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      timeAgo: timeAgo(post.time), // function to convert time to "time ago" format
    }));

    res.json({
      posts: modifiedPosts,
      totalPosts: user.post_ids.length,
      user: {
        name: user.name,
        profile_url: user.profile_url
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to load your posts" });
  }
});

module.exports = { viewuserPostRoute: router };
