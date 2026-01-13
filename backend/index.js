const express=require('express');
const bcrypt=require('bcrypt');
const mongoose=require('mongoose');
const {userModel}=require('./db');
const {postModel}=require('./db');
const {commentModel}=require('./db');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const {z, success} = require("zod");
const {uploadRoute} = require("./upload");
const {getpostRoute} = require("./getallpost");
const {myPostRoute}=require("./getmypost");
const {uploadprofileRoute}=require("./uploadprofile");
const {commentRoute}=require("./comments");
const {viewuserPostRoute}=require("./getviewuserpost");


mongoose.connect("mongodb+srv://dharaneesh1881:Dd%409790361881@cluster0.su0jsfi.mongodb.net/tweet");
const {JWT_SECRET}=require('./auth');
const{auth}=require('./auth');  
const app= express();
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
    credentials: true
  })
);
app.use(require("cookie-parser")());

app.post("/signup",async function(req,res){
    const requiredbody = z.object({
    name: z.string().min(3, "Name too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6 characters")
    });

    const parsedDatawithSuccess=requiredbody.safeParse(req.body);

    if(!parsedDatawithSuccess.success){
        res.status(400).json({
            message:parsedDatawithSuccess.error.issues.map((e)=>e.message).join(", ")
        });
        return ;
    }

    const name=req.body.name ; 
    const email=req.body.email;
    const password=req.body.password;
    
    let error=false;
    try{
        const hashedpassword= await bcrypt.hash(password,5);
        
        await userModel.create({
            name:name,
            email:email,
            password:hashedpassword
            
        });
    }
    catch(e){
        console.log(e);
        error=true;
        res.status(409).json({
            message:"user already exists"
        });
    }
    if(!error){
        res.json({
            message:"User signed up"
        });
    }
 
});

app.post("/login", async function(req,res){
    const requiredbody = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6 characters")
    });

    const parsedDatawithSuccess=requiredbody.safeParse(req.body);

    if(!parsedDatawithSuccess.success){
        res.status(400).json({
            message:parsedDatawithSuccess.error.issues.map((e)=>e.message).join(", ")
        });
        return ;
    }

    const email=req.body.email;
    const password=req.body.password;
 
    const user = await userModel.findOne({
        email:email
    });

    if(!user){
        res.status(403).json({
            message:"user does not exist"
        });
        return ;
    }

    const passwordMatch = await bcrypt.compare(password,user.password);

    if(passwordMatch){
        const token =jwt.sign({
            id:user._id
        },JWT_SECRET);

        res.cookie("token", token, {
        httpOnly: true,
        secure: false,     // true in production (HTTPS)
        sameSite: "lax"
        });

        if(user.profile_url==undefined){
            user.profile_url="https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740&q=80",
            await user.save();
        }

        res.json({ message: "Login success" ,
            token:token,
            name:user.name,
            profile_url:user.profile_url
        });

    }
    else{
        res.status(403).json({
            message:"incorrect cretentials"
        });
        return ;
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

/* await fetch(`/post/${post._id}/likeon`, {
      method: "POST",
      credentials: "include"
    });
*/


app.get("/mytotalpost", auth, async (req, res) => {
  const user = await userModel.findById(req.userId);
  res.json({ totalPosts: user.post_ids.length,
    name:user.name,
    profile_url:user.profile_url
   });
});

app.use("/getmypost", myPostRoute);


app.delete("/deletepost/:id",auth,async (req, res) => {
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

    await postModel.findByIdAndDelete(postId);

    await userModel.findByIdAndUpdate(userId, {
      $pull: { post_ids: postId }
    });

    res.json({ message: "Post deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
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

  const parsedDatawithSuccess=requiredbody.safeParse(req.body);

  if(!parsedDatawithSuccess.success){
      res.status(400).json({
          message:parsedDatawithSuccess.error.issues.map((e)=>e.message).join(", ")
      });
      return ;
  }

  let error=false;
  try {
    if (req.body.name) {
      await userModel.findByIdAndUpdate(req.userId, { name: req.body.name });
    }
  } catch (e) {
    let error=true;
    res.status(400).json({
      message: "user name already exists"
    });
    return;
  }

  if(!error){
    res.json({ message: "Profile updated successfully",
      name: req.body.name
    });
  }
});

app.put("/changepassword", auth, async (req, res) => {
  
  const user = await userModel.findById(req.userId).select(
    "password"
  );

  const passwordMatch = await bcrypt.compare(req.body.currentPassword,user.password);

  if(!passwordMatch){
    res.status(403).json({
        message:"incorrect oldcurrent password"
    });
    return ;
  } 

  const requiredbody = z.object({
    newPassword: z.string().min(6, "Password must be 6 characters")
  });

  const parsedDatawithSuccess=requiredbody.safeParse(req.body);

  if(!parsedDatawithSuccess.success){
      res.status(400).json({
          message:parsedDatawithSuccess.error.issues.map((e)=>e.message).join(", ")
      });
      return ;
  }

  const updateData = {};
  if (req.body.newPassword) {
    updateData.password = await bcrypt.hash(req.body.newPassword, 5);
  }

  await userModel.findByIdAndUpdate(req.userId, updateData);
  res.json({ message: "Password updated successfully" });
});

app.use("/updateprofilepicture", uploadprofileRoute);

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
    message: alreadyLiked ? "Like removed" : "Liked" ,
    success: true
  });
});

// Dislike a comment
app.post("/comment/:id/dislike", auth, async (req, res) => {
  const userId = req.userId;
  const commentId = req.params.id;

  const comment = await commentModel.findById(commentId);

  if (!comment) {
    return res.status(404).json({ message: "Comment not found",success:false });
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

    res.json({ message: "Comment deleted successfully" ,success:true});

  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment" ,success:false});
  }
});

// get particular user's posts;
app.use("/getuserpost/:id", viewuserPostRoute);



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