const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

router.post("/add/:quizId", questionController.addQuestion);

router.put("/:questionId", questionController.updateQuestion);

router.delete("/:questionId", questionController.deleteQuestion);

router.get("/:questionId", questionController.getQuestion);

module.exports = router;
