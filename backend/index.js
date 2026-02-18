require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { userModel } = require('./db');
const { postModel } = require('./db');
const { commentModel } = require('./db');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const { z, success } = require("zod");
const { uploadRoute } = require("./upload");
const { getpostRoute } = require("./getallpost");
const { myPostRoute } = require("./getmypost");
const { uploadprofileRoute } = require("./uploadprofile");
const { commentRoute } = require("./comments");
const { viewuserPostRoute } = require("./getviewuserpost");


mongoose.connect(process.env.MONGO_URI);
const { JWT_SECRET } = require('./auth');
const { auth } = require('./auth');
const app = express();
app.use(express.json());
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);
app.use(require("cookie-parser")());

app.post("/signup", async function (req, res) {
  const requiredbody = z.object({
    name: z.string().min(3, "Name too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6 characters")
  });

  const parsedDatawithSuccess = requiredbody.safeParse(req.body);

  if (!parsedDatawithSuccess.success) {
    res.status(400).json({
      message: parsedDatawithSuccess.error.issues.map((e) => e.message).join(", ")
    });
    return;
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  let error = false;
  try {
    const hashedpassword = await bcrypt.hash(password, 5);

    await userModel.create({
      name: name,
      email: email,
      password: hashedpassword

    });
  }
  catch (e) {
    console.error(e);
    error = true;
    res.status(409).json({
      message: "user already exists"
    });
  }
  if (!error) {
    res.json({
      message: "User signed up"
    });
  }

});

app.post("/login", async function (req, res) {
  const requiredbody = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6 characters")
  });

  const parsedDatawithSuccess = requiredbody.safeParse(req.body);

  if (!parsedDatawithSuccess.success) {
    res.status(400).json({
      message: parsedDatawithSuccess.error.issues.map((e) => e.message).join(", ")
    });
    return;
  }

  const email = req.body.email;
  const password = req.body.password;

  const user = await userModel.findOne({
    email: email
  });

  if (!user) {
    res.status(403).json({
      message: "user does not exist"
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const token = jwt.sign({
      id: user._id
    }, JWT_SECRET);

    const isProduction = (process.env.CORS_ORIGINS || "").includes("https");
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    if (user.profile_url == undefined) {
      user.profile_url = "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg",
        await user.save();
    }

    res.json({
      message: "Login success",
      token: token,
      name: user.name,
      profile_url: user.profile_url
    });

  }
  else {
    res.status(403).json({
      message: "incorrect cretentials"
    });
    return;
  }

});

app.use("/putpost", uploadRoute);

app.use("/getpost", getpostRoute);

app.post("/post/:id/likeon", auth, async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  await postModel.findByIdAndUpdate(postId, {
    $addToSet: { likes: userId },   // add if not exists
    $pull: { dislikes: userId }     // remove dislike
  });

  res.json({ message: "Post liked" });
});

app.post("/post/:id/likeoff", auth, async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  await postModel.findByIdAndUpdate(postId, {
    $pull: { likes: userId }        // remove like
  });

  res.json({ message: "Like removed" });
});

app.post("/post/:id/dislikeon", auth, async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  await postModel.findByIdAndUpdate(postId, {
    $addToSet: { dislikes: userId }, // add if not exists
    $pull: { likes: userId }         // remove like
  });

  res.json({ message: "Post disliked" });
});

app.post("/post/:id/dislikeoff", auth, async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  await postModel.findByIdAndUpdate(postId, {
    $pull: { dislikes: userId }      // remove dislike
  });

  res.json({ message: "Dislike removed" });
});

// Get list of users who liked a post
app.get("/post/:id/likedby", auth, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id)
      .populate("likes", "name profile_url")
      .select("likes");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ users: post.likes });
  } catch (err) {
    console.error("Error fetching liked by users:", err);
    res.status(500).json({ message: "Failed to fetch liked by users" });
  }
});

/* await fetch(`/post/${post._id}/likeon`, {
      method: "POST",
      credentials: "include"
    });
*/


app.get("/mytotalpost", auth, async (req, res) => {
  const user = await userModel.findById(req.userId);
  res.json({
    totalPosts: user.post_ids.length,
    name: user.name,
    profile_url: user.profile_url
  });
});

app.use("/getmypost", myPostRoute);


app.delete("/deletepost/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete from database
    await postModel.findByIdAndDelete(postId);

    // Remove post ID from user's post_ids array
    await userModel.findByIdAndUpdate(userId, {
      $pull: { post_ids: postId }
    });

    // Delete all comments (and replies) associated with this post
    await commentModel.deleteMany({ postId: postId });

    // Delete media from Cloudinary asynchronously (fire-and-forget)
    if (post.url) {
      const { deleteFromCloudinaryAsync } = require('./cloudinaryUtils');
      const resourceType = post.type === 'video' ? 'video' : 'image';
      deleteFromCloudinaryAsync(post.url, resourceType);
    }

    res.json({ message: "Post deleted successfully" });

  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

// Edit post - update title, description, tags
app.put("/editpost/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;

    const updatedPost = await postModel.findByIdAndUpdate(postId, updateData, { new: true })
      .populate("userId", "name profile_url");

    res.json({ message: "Post updated successfully", post: updatedPost });

  } catch (err) {
    console.error("Error editing post:", err);
    res.status(500).json({ message: "Failed to edit post" });
  }
});

app.get("/profile", auth, async (req, res) => {
  const user = await userModel.findById(req.userId).select(
    "name profile_url"
  );

  res.json({
    username: user.name,
    profile_url: user.profile_url
  });
});

app.put("/changeusername", auth, async (req, res) => {

  const requiredbody = z.object({
    name: z.string().min(3, "Name too short").max(20, "Name too long")
  });

  const parsedDatawithSuccess = requiredbody.safeParse(req.body);

  if (!parsedDatawithSuccess.success) {
    res.status(400).json({
      message: parsedDatawithSuccess.error.issues.map((e) => e.message).join(", ")
    });
    return;
  }

  let error = false;
  try {
    if (req.body.name) {
      await userModel.findByIdAndUpdate(req.userId, { name: req.body.name });
    }
  } catch (e) {
    let error = true;
    res.status(400).json({
      message: "user name already exists"
    });
    return;
  }

  if (!error) {
    res.json({
      message: "Profile updated successfully",
      name: req.body.name
    });
  }
});

app.put("/changepassword", auth, async (req, res) => {

  const user = await userModel.findById(req.userId).select(
    "password"
  );

  const passwordMatch = await bcrypt.compare(req.body.currentPassword, user.password);

  if (!passwordMatch) {
    res.status(403).json({
      message: "incorrect oldcurrent password"
    });
    return;
  }

  const requiredbody = z.object({
    newPassword: z.string().min(6, "Password must be 6 characters")
  });

  const parsedDatawithSuccess = requiredbody.safeParse(req.body);

  if (!parsedDatawithSuccess.success) {
    res.status(400).json({
      message: parsedDatawithSuccess.error.issues.map((e) => e.message).join(", ")
    });
    return;
  }

  const updateData = {};
  if (req.body.newPassword) {
    updateData.password = await bcrypt.hash(req.body.newPassword, 5);
  }

  await userModel.findByIdAndUpdate(req.userId, updateData);
  res.json({ message: "Password updated successfully" });
});

app.use("/updateprofilepicture", uploadprofileRoute);

// Remove profile picture - dedicated POST route (avoids DELETE method issues on hosted platforms)
app.post("/removeprofilepicture", auth, async (req, res) => {
  try {
    const defaultUrl = "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg";
    const { deleteFromCloudinaryAsync } = require('./cloudinaryUtils');

    const user = await userModel.findById(req.userId);
    const oldProfileUrl = user?.profile_url;

    await userModel.findByIdAndUpdate(req.userId, {
      profile_url: defaultUrl
    });

    if (oldProfileUrl && oldProfileUrl !== defaultUrl) {
      deleteFromCloudinaryAsync(oldProfileUrl, 'image');
    }

    res.json({
      message: "Profile picture removed",
      profile_url: defaultUrl
    });
  } catch (err) {
    console.error("Error removing profile picture:", err);
    res.status(500).json({ message: "Failed to remove profile picture" });
  }
});

// Delete Account - removes user, all their posts, comments, likes, and media
app.post("/deleteaccount", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { deleteFromCloudinaryAsync } = require('./cloudinaryUtils');
    const defaultProfileUrl = "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg";

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Get all posts by this user
    const userPosts = await postModel.find({ userId: userId });

    // 2. Delete media from Cloudinary for each post
    for (const post of userPosts) {
      if (post.url) {
        const resourceType = post.type === 'video' ? 'video' : 'image';
        deleteFromCloudinaryAsync(post.url, resourceType);
      }
    }

    // 3. Delete all comments on the user's posts
    const userPostIds = userPosts.map(p => p._id);
    if (userPostIds.length > 0) {
      await commentModel.deleteMany({ postId: { $in: userPostIds } });
    }

    // 4. Delete all comments made by this user on OTHER posts
    //    First, find the parent comments to decrement commentCount on those posts
    const userCommentsOnOtherPosts = await commentModel.find({
      userId: userId,
      postId: { $nin: userPostIds },  // not on their own posts (already handled)
      parentCommentId: null           // only parent comments affect commentCount
    });

    // Decrement commentCount for each affected post
    for (const comment of userCommentsOnOtherPosts) {
      await postModel.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: -1 }
      });
    }

    // Delete all comments (including replies) by this user on other posts
    await commentModel.deleteMany({
      userId: userId,
      postId: { $nin: userPostIds }
    });

    // 5. Remove user's likes/dislikes from all posts
    await postModel.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );
    await postModel.updateMany(
      { dislikes: userId },
      { $pull: { dislikes: userId } }
    );

    // 6. Remove user's likes/dislikes from all comments
    await commentModel.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );
    await commentModel.updateMany(
      { dislikes: userId },
      { $pull: { dislikes: userId } }
    );

    // 7. Delete user's profile picture from Cloudinary (if not default)
    if (user.profile_url && user.profile_url !== defaultProfileUrl) {
      deleteFromCloudinaryAsync(user.profile_url, 'image');
    }

    // 8. Delete all user's posts from database
    await postModel.deleteMany({ userId: userId });

    // 9. Delete the user document
    await userModel.findByIdAndDelete(userId);

    // 10. Clear auth cookie
    const isProduction = (process.env.CORS_ORIGINS || "").includes("https");
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

// Comments route (post a comment, get parent comments )
app.use("/post", commentRoute);

// Get replies for a comment
app.get("/comment/:commentId/replies", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const replies = await commentModel
      .find({ parentCommentId: req.params.commentId })
      .sort({ createdAt: 1 })
      .populate("userId", "name profile_url");

    const modifiedReplies = replies.map(reply => ({
      ...reply._doc,
      isLiked: reply.likes.includes(userId),
      isDisliked: reply.dislikes.includes(userId),
      likesCount: reply.likes.length,
      dislikesCount: reply.dislikes.length
    }));

    res.json({ replies: modifiedReplies });

  } catch (err) {
    res.status(500).json({ message: "Failed to load replies" });
  }
});


// Like a comment
app.post("/comment/:id/like", auth, async (req, res) => {
  const userId = req.userId;
  const commentId = req.params.id;

  const comment = await commentModel.findById(commentId);

  if (!comment) {
    return res.status(404).json({ message: "Comment not found", success: false });
  }

  const alreadyLiked = comment.likes.includes(userId);

  await commentModel.findByIdAndUpdate(commentId, {
    [alreadyLiked ? "$pull" : "$addToSet"]: { likes: userId },
    $pull: { dislikes: userId }
  });

  res.json({
    message: alreadyLiked ? "Like removed" : "Liked",
    success: true
  });
});

// Dislike a comment
app.post("/comment/:id/dislike", auth, async (req, res) => {
  const userId = req.userId;
  const commentId = req.params.id;

  const comment = await commentModel.findById(commentId);

  if (!comment) {
    return res.status(404).json({ message: "Comment not found", success: false });
  }

  const alreadyDisliked = comment.dislikes.includes(userId);

  await commentModel.findByIdAndUpdate(commentId, {
    [alreadyDisliked ? "$pull" : "$addToSet"]: { dislikes: userId },
    $pull: { likes: userId }
  });

  res.json({
    message: alreadyDisliked ? "Dislike removed" : "Disliked",
    success: true
  });
});

// Delete a comment
app.delete("/comment/:id", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const commentId = req.params.id;

    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found", success: false });
    }

    const post = await postModel.findById(comment.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const isCommentOwner = comment.userId.toString() === userId;
    const isPostOwner = post.userId.toString() === userId;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: "Not allowed", success: false });
    }

    await commentModel.deleteMany({
      $or: [
        { _id: comment._id },
        { parentCommentId: comment._id }
      ]
    });

    if (!comment.parentCommentId) {
      await postModel.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: -1 }
      });
    }

    res.json({ message: "Comment deleted successfully", success: true });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment", success: false });
  }
});

// get particular user's posts;
app.use("/getuserpost/:name", viewuserPostRoute);

// search users by username
app.get("/search/users", auth, async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.json({ users: [] });
    }

    const users = await userModel.find(
      {
        name: { $regex: query, $options: "i" }
      },
      {
        name: 1,
        profile_url: 1,
        _id: 1
      }
    ).limit(10);

    res.json({ users });

  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

app.get("/sharepost/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await postModel
      .findById(postId)
      .populate("userId", "name profile_url");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let userId = null;
    try {
      if (req.cookies?.token) {
        const decoded = jwt.verify(req.cookies.token, JWT_SECRET);
        userId = decoded.id;
      }
    } catch (e) { }

    res.json({
      ...post._doc,
      isLiked: userId ? post.likes.includes(userId) : false,
      isDisliked: userId ? post.dislikes.includes(userId) : false,
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      canInteract: !!userId // 👈 frontend uses this
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to load post" });
  }
});


const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try: PORT=3001 node index.js`);
    process.exit(1);
  }
  throw err;
});