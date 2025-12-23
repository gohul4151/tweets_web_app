const express=require('express');
const bcrypt=require('bcrypt');
const mongoose=require('mongoose');
const {userModel}=require('./db');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const {z} = require("zod");
const {uploadRoute} = require("./upload");
const {getpostRoute} = require("./getallpost");
const {myPostRoute}=require("./getmypost");


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

app.use("/getmypost", myPostRoute);




app.listen(3000);
