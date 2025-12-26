const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Quiz title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "active", "completed"],
    default: "scheduled",
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  settings: {
    showLeaderboard: {
      type: Boolean,
      default: true,
    },
    allowMultipleAttempts: {
      type: Boolean,
      default: false,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update status based on time
quizSchema.pre("save", function (next) {
  const now = new Date();

  if (now < this.startTime) {
    this.status = "scheduled";
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = "active";
  } else {
    this.status = "completed";
  }

  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
quizSchema.index({ code: 1 });
quizSchema.index({ host: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ startTime: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);
module.exports = Quiz;
