const express = require("express");
const multer = require("multer");
const cloudinary = require("./cloudinary");
const { auth } = require("./auth"); // IMPORTANT FIX
const { userModel, postModel } = require("./db");
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
    let uploadResult = null;
    let fileType = "text";

    // Only upload to Cloudinary if a file is attached
    if (req.file) {
      fileType = req.file.mimetype.startsWith("video") ? "video" : "image";

      uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: fileType,
            folder: fileType === "image" ? "images" : "video",
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
    }

    const { title, description, tag } = req.body;

    // Must have at least some content
    if (!req.file && !title?.trim() && !description?.trim()) {
      return res.status(400).json({ message: "Post must have a title, description, or an attachment" });
    }

    try {
      const post = await postModel.create({
        userId: req.userId,
        url: uploadResult ? uploadResult.secure_url : null,
        type: uploadResult ? uploadResult.resource_type : "text",
        time: uploadResult ? uploadResult.created_at : new Date().toISOString(),
        title: title || "",
        description: description || "",
        tags: tag || ""
      });

      await userModel.findByIdAndUpdate(req.userId, {
        $push: {
          post_ids: { $each: [post._id], $position: 0 }
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error in saving post to DB" });
      return;
    }

    res.json({
      url: uploadResult ? uploadResult.secure_url : null,
      type: fileType,
      message: "File uploaded successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { uploadRoute: router };

//uploadResult.secure_url
//created_at: '2025-12-18T08:55:24Z'
//resource_type: 'video' or 'image' 