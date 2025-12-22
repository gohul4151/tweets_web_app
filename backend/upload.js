const express = require("express");
const multer = require("multer");
const cloudinary = require("./cloudinary");
const { auth }= require("./auth"); // IMPORTANT FIX
const { userModel,postModel } = require("./db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./auth");




const router = express.Router();

// Multer (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Upload API
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: fileType,
          folder: fileType === "image" ? "images" : "video",

          // TRANSFORMATIONS (ONLY FOR IMAGES)
          transformation:
            fileType === "image"
              ? [
                  { width: 500, crop: "scale" },
                  { quality: "auto:best" },
                  { fetch_format: "auto" }
                ]
              : undefined
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    console.log(uploadResult);


    try {
      const { title, description ,tag} = req.body;

      //const token = req.cookies.token;
      //const decoded = jwt.verify(token,JWT_SECRET);
      //const userId=decoded.id;

      const post=await postModel.create({
        userId:req.userId,
        url:uploadResult.secure_url,
        type:uploadResult.resource_type,
        time:uploadResult.created_at,
        title:title,
        description:description,
        tags:tag   
      });

      const user = await userModel.findOne({
         _id:req.userId
      });

      user.post_ids.unshift(post._id);
      await user.save();
    }
    catch (e) {
        console.log(e);
        res.status(500).json({            
        message:"Error in saving post to DB"
        });
        return;
    }

    res.json({
      url: uploadResult.secure_url,
      type: fileType,
      message: "File uploaded successfully"
    });

  } catch (error) {
    res.status(500).json({message: error.message });
  }
});

module.exports = { uploadRoute: router };
 //uploadResult.secure_url
 //created_at: '2025-12-18T08:55:24Z'
 //resource_type: 'video' or 'image' 