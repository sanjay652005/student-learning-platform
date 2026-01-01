import express from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import  protect  from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createQuiz).get(protect, getQuizzes);
router
  .route("/:id")
  .get(protect, getQuizById)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

export default router;


