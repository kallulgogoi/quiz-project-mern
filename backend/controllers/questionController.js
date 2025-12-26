const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

// Add a single question manually
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const {
      questionText,
      questionType,
      options,
      correctAnswers,
      points,
      timeLimit,
      explanation,
    } = req.body;

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
        message: "Only the host can add questions",
      });
    }

    // Determine order
    const count = await Question.countDocuments({ quiz: quizId });

    const question = new Question({
      quiz: quizId,
      questionText,
      questionType,
      options: options || [],
      correctAnswers: correctAnswers || [],
      points: points || 1,
      timeLimit: timeLimit || 30,
      explanation: explanation || "",
      order: count + 1,
    });

    await question.save();

    // Add to quiz's question array
    quiz.questions.push(question._id);
    await quiz.save();

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      question,
    });
  } catch (error) {
    console.error("Add question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add question",
    });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updates = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Find quiz to check host permission
    const quiz = await Quiz.findById(question.quiz);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Associated quiz not found" });
    }

    if (quiz.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the host can update questions",
      });
    }

    // Perform updates
    Object.keys(updates).forEach((key) => {
      question[key] = updates[key];
    });

    await question.save();

    res.json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
    });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const quiz = await Quiz.findById(question.quiz);
    if (quiz) {
      // Check permission
      if (quiz.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only the host can delete questions",
        });
      }

      // Remove from quiz array
      quiz.questions = quiz.questions.filter(
        (qId) => qId.toString() !== questionId
      );
      await quiz.save();
    }

    // Delete the question document
    await Question.findByIdAndDelete(questionId);

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
    });
  }
};

// Get a single question
exports.getQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
