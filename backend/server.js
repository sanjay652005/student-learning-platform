import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import questionPaperRoutes from "./routes/questionPaperRoutes.js";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// 🔑 Fix for ES Modules (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

/* ============================
   CORS
   ============================ */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ============================
   Body Parser
   ============================ */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ============================
   🔓 PUBLIC STATIC FILES
   (FOR PDF PREVIEW)
   ============================ */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ============================
   API ROUTES
   ============================ */
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/question-papers", questionPaperRoutes);

/* ============================
   HEALTH CHECK
   ============================ */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* ============================
   ERROR HANDLERS
   ============================ */
app.use(notFound);
app.use(errorHandler);

/* ============================
   SERVER START
   ============================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


