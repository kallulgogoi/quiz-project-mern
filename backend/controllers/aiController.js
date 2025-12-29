const geminiService = require("../services/geminiService");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
exports.generateQuestions = async (req, res) => {
  try {
    const {
      topic,
      count = 5,
      questionTypes = ["mcq", "multiple-correct", "fill-blank"],
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    // Generate questions using Gemini
    const result = await geminiService.generateQuizQuestions(
      topic,
      count,
      questionTypes
    );

    res.json({
      success: true,
      questions: result.questions,
    });
  } catch (error) {
    console.error("Generate questions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate questions",
    });
  }
};

// Generate Question from Text
exports.generateQuestionFromText = async (req, res) => {
  try {
    const { text, questionType = "mcq" } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    // Generate question using Gemini
    const result = await geminiService.generateQuestionFromText(
      text,
      questionType
    );

    res.json({
      success: true,
      question: result,
    });
  } catch (error) {
    console.error("Generate question from text error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate question",
    });
  }
};

// Save AI Generated Questions
exports.saveGeneratedQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required",
      });
    }

    // Get quiz
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

    // Save questions
    const savedQuestions = [];
    let order = (await Question.countDocuments({ quiz: quizId })) + 1;

    for (const q of questions) {
      const question = new Question({
        quiz: quizId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || [],
        correctAnswers: q.correctAnswers || [],
        explanation: q.explanation || "",
        points: q.points || 1,
        // No timeLimit here
        order: order++,
      });

      await question.save();
      savedQuestions.push(question);

      // Add question to quiz
      quiz.questions.push(question._id);
    }

    await quiz.save();

    res.status(201).json({
      success: true,
      message: "Questions saved successfully",
      questions: savedQuestions,
    });
  } catch (error) {
    console.error("Save generated questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save questions",
    });
  }
};
