const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("./cloudinary");
const { auth } = require("./auth");
const { userModel } = require("./db");
const upload = require("./upload");

const storage = multer.memoryStorage();
const uploadprofile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});


router.put("/", auth, uploadprofile.single("profileurl"), async (req, res) => {
  const defaultUrl = "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg";
  const { deleteFromCloudinaryAsync } = require('./cloudinaryUtils');

  // Get the user's current profile picture before updating
  const user = await userModel.findById(req.userId);
  const oldProfileUrl = user?.profile_url;

  // If no file, revert to default
  if (!req.file) {
    await userModel.findByIdAndUpdate(req.userId, {
      profile_url: defaultUrl
    });

    // Delete old profile from Cloudinary if it's not the default
    if (oldProfileUrl && oldProfileUrl !== defaultUrl) {
      deleteFromCloudinaryAsync(oldProfileUrl, 'image');
    }

    return res.json({
      message: "Profile picture removed (reverted to default)",
      profile_url: defaultUrl
    });
  }

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "profile_pics",
        transformation: [
          { width: 300, height: 300, crop: "fill" },
          { quality: "auto", fetch_format: "auto" }
        ]
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(req.file.buffer);
  });

  await userModel.findByIdAndUpdate(req.userId, {
    profile_url: uploadResult.secure_url
  });

  // Delete old profile from Cloudinary if it's not the default
  if (oldProfileUrl && oldProfileUrl !== defaultUrl) {
    deleteFromCloudinaryAsync(oldProfileUrl, 'image');
  }

  res.json({
    message: "Profile picture updated",
    profile_url: uploadResult.secure_url
  });
});

// DELETE route - Remove profile picture
router.delete("/", auth, async (req, res) => {
  try {
    const defaultUrl = "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg";
    const { deleteFromCloudinaryAsync } = require('./cloudinaryUtils');

    // Get the user's current profile picture
    const user = await userModel.findById(req.userId);
    const oldProfileUrl = user?.profile_url;

    // Set to default profile picture
    await userModel.findByIdAndUpdate(req.userId, {
      profile_url: defaultUrl
    });

    // Delete old profile from Cloudinary if it's not the default
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

module.exports = { uploadprofileRoute: router };