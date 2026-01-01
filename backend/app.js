import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import quizRoutes from "./routes/aiQuizRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/quizzes", quizRoutes);

app.get("/", (req, res) => res.send("API is running..."));

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



