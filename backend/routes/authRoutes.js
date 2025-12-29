const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public Route
router.post("/google", authController.googleAuth);

// Protected Routes
router.get("/me", auth, authController.getCurrentUser);
router.put(
  "/profile",
  auth,
  upload.single("profilePicture"),
  authController.updateProfile
);

module.exports = router;
