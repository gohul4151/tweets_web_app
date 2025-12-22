const express = require('express');
const { auth } = require('./auth');
const { postModel } = require('./db');  
const { userModel } = require('./db');

const router = express.Router();

router.get("/",auth, async (req, res) => {
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await postModel
      .find({})
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name profile_url");

    res.json({ posts });
    
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts"
    });
  }
});

module.exports = { getpostRoute: router };


//http://localhost:3000/post?page=1  like this client send request to me 