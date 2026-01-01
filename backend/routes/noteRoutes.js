import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getNotes,
  getNoteById,
  createNote,
  deleteNote,
  downloadNote,
  getMyNotes,
} from "../controllers/noteController.js";

const router = express.Router();

/* =========================
   PUBLIC
   ========================= */
router.get("/", getNotes);

/* =========================
   PRIVATE (ORDER IS IMPORTANT)
   ========================= */
router.get("/my", protect, getMyNotes); // ✅ MUST BE BEFORE :id
router.post("/", protect, createNote);
router.delete("/:id", protect, deleteNote);
router.get("/:id/download", protect, downloadNote);

/* =========================
   PUBLIC
   ========================= */
router.get("/:id", getNoteById);

export default router;





