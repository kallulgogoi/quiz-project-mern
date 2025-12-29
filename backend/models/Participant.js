const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      pointsEarned: Number,
      timeTaken: Number, // in seconds
    },
  ],
  totalScore: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number, // total time in seconds
    default: 0,
  },
  rank: {
    type: Number,
  },
  attemptCount: {
    type: Number,
    default: 1,
  },
  lastAttemptAt: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  finishedAt: {
    type: Date,
  },
});
participantSchema.index({ quiz: 1, user: 1 }, { unique: true });

// Calculate rank pre-save
participantSchema.pre("save", async function (next) {
  if (this.isModified("totalScore") && this.completed) {
    const participants = await this.constructor
      .find({
        quiz: this.quiz,
        completed: true,
      })
      .sort({ totalScore: -1, timeTaken: 1 });

    this.rank = participants.findIndex((p) => p._id.equals(this._id)) + 1;
  }
  next();
});

const Participant = mongoose.model("Participant", participantSchema);
module.exports = Participant;
