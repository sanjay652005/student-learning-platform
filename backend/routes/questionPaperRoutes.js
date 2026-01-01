import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getQuestionPapers,
  getQuestionPaperById,
  getMyQuestionPapers,
  createQuestionPaper,
  deleteQuestionPaper,
  downloadQuestionPaper,
} from "../controllers/questionPaperController.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getQuestionPapers);

/* PRIVATE — BEFORE :id */
router.get("/my", protect, getMyQuestionPapers);
router.post("/", protect, createQuestionPaper);
router.get("/:id/download", protect, downloadQuestionPaper);
router.delete("/:id", protect, deleteQuestionPaper);

/* PUBLIC — MUST BE LAST */
router.get("/:id", getQuestionPaperById);

export default router;




