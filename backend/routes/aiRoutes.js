const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { auth } = require("../middleware/auth");

router.use(auth);

router.post("/generate-questions", aiController.generateQuestions);
router.post("/generate-from-text", aiController.generateQuestionFromText);
router.post("/save-questions/:quizId", aiController.saveGeneratedQuestions);

module.exports = router;
