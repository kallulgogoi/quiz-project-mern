const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    // Check if user is verified (except for some routes)
    if (
      !user.isVerified &&
      req.path !== "/verify-otp" &&
      req.path !== "/resend-otp"
    ) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Please authenticate",
    });
  }
};

const isHost = async (req, res, next) => {
  try {
    const quizId = req.params.quizId || req.body.quizId;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the host of this quiz",
      });
    }

    req.quiz = quiz;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { auth, isHost };
