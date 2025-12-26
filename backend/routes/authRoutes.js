const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", authController.login);
router.post("/google", authController.googleCallback);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/me", auth, authController.getCurrentUser);
router.put(
  "/profile",
  auth,
  upload.single("profilePicture"),
  authController.updateProfile
);
router.put("/change-password", auth, authController.changePassword);

module.exports = router;
