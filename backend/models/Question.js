const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  questionType: {
    type: String,
    enum: ["mcq", "multiple-correct", "fill-blank", "descriptive"],
    required: true,
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  questionImage: {
    type: String, // Cloudinary URL
    default: "",
  },
  options: [
    {
      text: String,
      image: String, // Cloudinary URL for option image
      isCorrect: Boolean,
    },
  ],
  correctAnswers: [String], // For fill-blank and descriptive
  points: {
    type: Number,
    default: 1,
    min: 1,
  },
  // Removed timeLimit
  explanation: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
