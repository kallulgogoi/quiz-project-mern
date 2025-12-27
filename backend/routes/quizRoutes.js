const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Quiz CRUD operations
router.post("/", quizController.createQuiz);
router.get("/code/:code", quizController.getQuizByCode);
router.post("/join", quizController.joinQuiz);
router.put("/:quizId", quizController.updateQuiz);
router.delete("/:quizId", quizController.deleteQuiz);

// User's quizzes
router.get("/my-quizzes", quizController.getUserQuizzes);
router.get("/:quizId", quizController.getQuizById);
// Quiz participation
router.post("/:quizId/start", quizController.startQuiz);
router.post("/:quizId/submit", quizController.submitAnswers);

// Leaderboard
router.get("/:quizId/leaderboard", quizController.getLeaderboard);
//attempts
router.get("/:quizId/attempt", quizController.getMyAttempt);

// Host controls
router.post("/:quizId/start-live", quizController.startQuizLive);
router.post("/:quizId/end-live", quizController.endQuizLive);

module.exports = router;
