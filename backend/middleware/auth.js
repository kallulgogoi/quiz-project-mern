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
    const quiz = await require("../models/Quiz").findById(quizId);

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
    console.error("isHost Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { auth, isHost };
