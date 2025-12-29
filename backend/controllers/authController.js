const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const generateUniqueUsername = async (baseName) => {
  let uniqueName = baseName;
  while (await User.findOne({ username: uniqueName })) {
    uniqueName = `${baseName}${Math.floor(Math.random() * 10000)}`;
  }
  return uniqueName;
};

exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, username, profilePicture } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      const baseName = username || email.split("@")[0];
      const uniqueUsername = await generateUniqueUsername(baseName);

      user = new User({
        googleId,
        email,
        username: uniqueUsername,
        profilePicture,
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("quizzesCreated", "title code startTime endTime status")
      .populate("quizzesParticipated.quiz", "title code");

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;
    const updateData = {};

    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });
      if (existingUser)
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      updateData.username = username;
    }
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });
    res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
