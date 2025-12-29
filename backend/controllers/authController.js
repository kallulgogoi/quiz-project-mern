const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otpGenerator");
const { sendOTPEmail } = require("../utils/emailService");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Generate OTP
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "verification",
    });

    // Send OTP email
    await sendOTPEmail(email, otp, "verification");

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: "verification",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update user verification status
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Get user
    const user = await User.findOne({ email });

    res.json({
      success: true,
      message: "Email verified successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Delete previous OTPs
    await OTP.deleteMany({ email, type: "verification" });

    // Generate new OTP
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "verification",
    });

    // Send OTP email
    await sendOTPEmail(email, otp, "verification");

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user has password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Please use Google to login",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Resend OTP
      const otp = generateOTP();
      await OTP.deleteMany({ email, type: "verification" });
      await OTP.create({
        email,
        otp,
        type: "verification",
      });
      await sendOTPEmail(email, otp, "verification");

      return res.status(401).json({
        success: false,
        message: "Please verify your email first. A new OTP has been sent.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Google OAuth Callback
exports.googleCallback = async (req, res) => {
  try {
    const { googleId, email, username, profilePicture } = req.body;

    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (user) {
      // Update googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true; // Google users are auto-verified
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId,
        email,
        username: username || email.split("@")[0],
        profilePicture,
        isVerified: true,
        password: undefined, // No password for Google users
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("quizzesCreated", "title code startTime endTime status")
      .populate("quizzesParticipated.quiz", "title code");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;

    const updateData = {};

    if (username) {
      // Check if username is taken
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
      updateData.username = username;
    }

    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete previous OTPs
    await OTP.deleteMany({ email, type: "reset" });

    // Generate OTP
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: "reset",
    });

    // Send OTP email
    await sendOTPEmail(email, otp, "reset");

    res.json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset OTP",
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: "reset",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
