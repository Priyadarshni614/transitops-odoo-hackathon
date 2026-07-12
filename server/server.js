require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const driverRoutes = require("./routes/driverRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// ======================
// API Routes
// ======================

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TransitOps API is running",
  });
});

// Driver Routes
app.use("/api/drivers", driverRoutes);

// ======================
// Database Connection
// ======================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected to local MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 TransitOps server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();