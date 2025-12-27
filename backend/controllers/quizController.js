const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Participant = require("../models/Participant");
const User = require("../models/User");
const { generateCode } = require("../utils/generateCode");

// Generate unique quiz code
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = generateCode(6);
    const existingQuiz = await Quiz.findOne({ code });
    if (!existingQuiz) {
      isUnique = true;
    }
  }

  return code;
};

// Create Quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      // endTime removed from input
      duration,
      settings = {},
    } = req.body;

    // Validate times
    const start = new Date(startTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Start time cannot be in the past",
      });
    }

    if (!duration || duration < 1) {
      return res.status(400).json({
        success: false,
        message: "Duration must be at least 1 minute",
      });
    }

    // Auto-calculate End Time
    const durationInMs = parseInt(duration) * 60 * 1000;
    const end = new Date(start.getTime() + durationInMs);

    // Generate unique code
    const code = await generateUniqueCode();

    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      code,
      host: req.user._id,
      startTime: start,
      endTime: end,
      duration: parseInt(duration),
      settings: {
        showLeaderboard:
          settings.showLeaderboard !== undefined
            ? settings.showLeaderboard
            : true,
        allowMultipleAttempts: settings.allowMultipleAttempts || false,
        shuffleQuestions: settings.shuffleQuestions || false,
        shuffleOptions: settings.shuffleOptions || false,
      },
    });

    await quiz.save();

    // Add to user's created quizzes
    await User.findByIdAndUpdate(req.user._id, {
      $push: { quizzesCreated: quiz._id },
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        code: quiz.code,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        status: quiz.status,
      },
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
    });
  }
};

// Get Quiz by Code
exports.getQuizByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const quiz = await Quiz.findOne({ code: code.toUpperCase() })
      .populate("host", "username profilePicture")
      .populate("questions")
      .populate("participants", "username profilePicture");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user can access the quiz
    const canAccess =
      quiz.host._id.toString() === req.user._id.toString() ||
      quiz.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
      );

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this quiz",
      });
    }

    res.json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz",
    });
  }
};

// Join Quiz
exports.joinQuiz = async (req, res) => {
  try {
    const { code } = req.body;

    const quiz = await Quiz.findOne({ code: code.toUpperCase() });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if quiz has ended
    if (quiz.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This quiz has ended",
      });
    }

    // Check if already joined
    const alreadyJoined = quiz.participants.includes(req.user._id);
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this quiz",
      });
    }

    // Add user to participants
    quiz.participants.push(req.user._id);
    await quiz.save();

    // Add to user's participated quizzes
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        quizzesParticipated: {
          quiz: quiz._id,
          attemptedAt: new Date(),
        },
      },
    });

    res.json({
      success: true,
      message: "Successfully joined the quiz",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        code: quiz.code,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        status: quiz.status,
      },
    });
  } catch (error) {
    console.error("Join quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join quiz",
    });
  }
};

// Update Quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updates = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user is host
    if (quiz.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the host can update this quiz",
      });
    }

    // Prevent updating if quiz has started
    if (quiz.status === "active" || quiz.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update an active or completed quiz",
      });
    }

    // Update quiz fields
    Object.keys(updates).forEach((key) => {
      // Don't allow manual endTime update via this route
      if (key !== "endTime") {
        quiz[key] = updates[key];
      }
    });

    // Recalculate End Time if start or duration changed
    if (updates.startTime || updates.duration) {
      const start = new Date(quiz.startTime);
      const durationInMs = quiz.duration * 60 * 1000;
      quiz.endTime = new Date(start.getTime() + durationInMs);
    }

    await quiz.save();

    res.json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quiz",
    });
  }
};

// Delete Quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user is host
    if (quiz.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the host can delete this quiz",
      });
    }

    // Delete related questions
    await Question.deleteMany({ quiz: quizId });

    // Delete participant records
    await Participant.deleteMany({ quiz: quizId });

    // Remove from user's created quizzes
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { quizzesCreated: quizId },
    });

    // Remove from participants' records
    await User.updateMany(
      { "quizzesParticipated.quiz": quizId },
      { $pull: { quizzesParticipated: { quiz: quizId } } }
    );

    // Delete quiz
    await Quiz.findByIdAndDelete(quizId);

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
    });
  }
};

// Get User's Quizzes
exports.getUserQuizzes = async (req, res) => {
  try {
    const { type } = req.query; // 'created' or 'participated'

    let quizzes;

    if (type === "created") {
      quizzes = await Quiz.find({ host: req.user._id })
        .sort({ createdAt: -1 })
        .populate("participants", "username profilePicture");
    } else if (type === "participated") {
      const participation = await Participant.find({ user: req.user._id })
        .sort({ lastAttemptAt: -1 })
        .populate("quiz");

      quizzes = participation.map((p) => p.quiz);
    } else {
      const created = await Quiz.find({ host: req.user._id });
      const participated = await Participant.find({
        user: req.user._id,
      }).populate("quiz");

      quizzes = {
        created,
        participated: participated.map((p) => ({
          quiz: p.quiz,
          score: p.totalScore,
          rank: p.rank,
        })),
      };
    }

    res.json({
      success: true,
      quizzes,
    });
  } catch (error) {
    console.error("Get user quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quizzes",
    });
  }
};

// Start Quiz (for participants)
exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user has joined
    const hasJoined = quiz.participants.includes(req.user._id);
    if (!hasJoined) {
      return res.status(403).json({
        success: false,
        message: "You have not joined this quiz",
      });
    }

    const now = new Date();

    // If quiz is scheduled, check start time
    if (quiz.status === "scheduled" && now < quiz.startTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz has not started yet",
      });
    }

    // If quiz is completed or time passed
    if (quiz.status === "completed" || now > quiz.endTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz has ended",
      });
    }

    // Check if already attempted
    const existingAttempt = await Participant.findOne({
      quiz: quizId,
      user: req.user._id,
    });

    if (existingAttempt) {
      if (!quiz.settings.allowMultipleAttempts && existingAttempt.completed) {
        return res.status(400).json({
          success: false,
          message: "You have already attempted this quiz",
        });
      }

      // Update attempt count
      existingAttempt.attemptCount += 1;
      existingAttempt.startedAt = now;
      existingAttempt.completed = false;
      await existingAttempt.save();
    } else {
      // Create new participant record
      await Participant.create({
        quiz: quizId,
        user: req.user._id,
        startedAt: now,
      });
    }

    // Get questions (shuffle if enabled)
    let questions = await Question.find({ quiz: quizId })
      .sort({ order: 1 })
      .select("-correctAnswers -explanation"); // Don't send answers to participant

    if (quiz.settings.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    res.json({
      success: true,
      message: "Quiz started",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        duration: quiz.duration,
        endTime: quiz.endTime, // Send this for countdown
      },
      questions,
      settings: quiz.settings,
    });
  } catch (error) {
    console.error("Start quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start quiz",
    });
  }
};

// Submit Quiz Answers
exports.submitAnswers = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if quiz is still active
    const now = new Date();
    // Allow a small buffer (e.g. 10 seconds) for network latency
    if (now > new Date(quiz.endTime).getTime() + 10000) {
      return res.status(400).json({
        success: false,
        message: "Quiz has ended",
      });
    }

    // Get participant record
    let participant = await Participant.findOne({
      quiz: quizId,
      user: req.user._id,
    });

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: "You have not started this quiz",
      });
    }

    if (participant.completed && !quiz.settings.allowMultipleAttempts) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this quiz",
      });
    }

    // Calculate score
    let totalScore = 0;
    const answerRecords = [];

    for (const answer of answers) {
      const question = quiz.questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      switch (question.questionType) {
        case "mcq":
          const correctOption = question.options.find((opt) => opt.isCorrect);
          isCorrect = correctOption && correctOption.text === answer.answer;
          pointsEarned = isCorrect ? question.points : 0;
          break;

        case "multiple-correct":
          const userAnswers = Array.isArray(answer.answer)
            ? answer.answer
            : [answer.answer];
          const correctAnswers = question.options
            .filter((opt) => opt.isCorrect)
            .map((opt) => opt.text);
          const correctCount = userAnswers.filter((ans) =>
            correctAnswers.includes(ans)
          ).length;
          isCorrect =
            correctCount === correctAnswers.length &&
            correctCount === userAnswers.length;
          pointsEarned = isCorrect ? question.points : 0;
          break;

        case "fill-blank":
          const correctBlank = question.correctAnswers[0];
          isCorrect =
            answer.answer.trim().toLowerCase() === correctBlank.toLowerCase();
          pointsEarned = isCorrect ? question.points : 0;
          break;

        case "descriptive":
          isCorrect = false;
          pointsEarned = 0;
          break;
      }

      totalScore += pointsEarned;

      answerRecords.push({
        question: question._id,
        answer: answer.answer,
        isCorrect,
        pointsEarned,
        timeTaken: answer.timeTaken || 0,
      });
    }

    // Update participant record
    participant.answers = answerRecords;
    participant.totalScore = totalScore;
    participant.timeTaken = answerRecords.reduce(
      (sum, ans) => sum + (ans.timeTaken || 0),
      0
    );
    participant.completed = true;
    participant.finishedAt = now;
    await participant.save();

    // Calculate rank
    const participants = await Participant.find({
      quiz: quizId,
      completed: true,
    }).sort({ totalScore: -1, timeTaken: 1 });

    const rank =
      participants.findIndex((p) => p._id.equals(participant._id)) + 1;
    participant.rank = rank;
    await participant.save();

    // Update user's participated quizzes with score
    await User.updateOne(
      {
        _id: req.user._id,
        "quizzesParticipated.quiz": quizId,
      },
      {
        $set: {
          "quizzesParticipated.$.score": totalScore,
          "quizzesParticipated.$.rank": rank,
        },
      }
    );

    // Notify Live Dashboard
    const io = req.app.get("io");
    if (io) {
      io.to(`quiz-${quizId}`).emit("leaderboard-update", {
        userId: req.user._id,
        username: req.user.username,
        score: totalScore,
        rank: rank,
      });
    }

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        score: totalScore,
        rank,
        totalQuestions: quiz.questions.length,
        correctAnswers: answerRecords.filter((ans) => ans.isCorrect).length,
        timeTaken: participant.timeTaken,
      },
    });
  } catch (error) {
    console.error("Submit answers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit answers",
    });
  }
};

// Get Quiz Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user can view leaderboard
    const canView =
      quiz.host.toString() === req.user._id.toString() ||
      quiz.participants.includes(req.user._id);

    if (!canView && !quiz.settings.showLeaderboard) {
      return res.status(403).json({
        success: false,
        message: "Leaderboard is not public for this quiz",
      });
    }

    const leaderboard = await Participant.find({
      quiz: quizId,
      completed: true,
    })
      .sort({ totalScore: -1, timeTaken: 1 })
      .populate("user", "username profilePicture")
      .limit(50); // Limit to top 50

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get leaderboard",
    });
  }
};

// Host: Start Quiz Live
exports.startQuizLive = async (req, res) => {
  try {
    const { quizId } = req.params;
    const io = req.app.get("io");

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // FORCE START: Update Start Time to NOW and Recalculate End Time
    const now = new Date();
    const durationInMs = quiz.duration * 60 * 1000;

    quiz.startTime = now;
    quiz.endTime = new Date(now.getTime() + durationInMs);
    quiz.status = "active";

    await quiz.save();

    // Notify all participants
    io.to(`quiz-${quizId}`).emit("quiz-started", {
      quizId,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
    });

    res.json({
      success: true,
      message: "Quiz started live",
    });
  } catch (error) {
    console.error("Start quiz live error:", error);
    res.status(500).json({ success: false, message: "Failed to start quiz" });
  }
};

// Host: End Quiz Live
exports.endQuizLive = async (req, res) => {
  try {
    const { quizId } = req.params;
    const io = req.app.get("io");

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if user is host
    if (quiz.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the host can end the quiz",
      });
    }

    // Update quiz status to completed
    quiz.status = "completed";
    quiz.endTime = new Date();
    await quiz.save();

    // Notify all participants via Socket.io
    io.to(`quiz-${quizId}`).emit("quiz-ended", {
      quizId,
      endTime: new Date(),
    });

    res.json({
      success: true,
      message: "Quiz ended",
    });
  } catch (error) {
    console.error("End quiz live error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end quiz live",
    });
  }
};

// Get Quiz By ID (for management/host)
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId)
      .populate("questions")
      .populate("participants", "username profilePicture");

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Security check: Only the host can access this view
    if (quiz.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error("Get quiz by ID error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
