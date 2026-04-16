const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");

// Load env variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Import database connection
const connectDB = require("./config/db");

// Initialize express
const app = express();
const server = http.createServer(app);

//SOCKET SETUP
const io = socketIo(server, {
  cors: {
    // Allow both localhost and potential production URL
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("join-quiz-room", (quizId) => {
    socket.join(`quiz-${quizId}`);
    console.log(`Socket ${socket.id} joined room: quiz-${quizId}`);
  });
  socket.on("submit-answer", (data) => {
    io.to(`quiz-${data.quizId}`).emit("answer-submitted", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Quiz App API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});
//cron job route
app.get("/ping", (req, res) => {
  res.status(200).send("Pong");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
