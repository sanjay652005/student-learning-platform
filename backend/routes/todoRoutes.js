import express from "express";
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";

import  protect  from "../middleware/authMiddleware.js";
import { todoValidator } from "../validators/todoValidator.js";

const router = express.Router();

// All routes protected
router.post("/", protect, todoValidator, createTodo);
router.get("/", protect, getTodos);
router.get("/:id", protect, getTodoById);
router.put("/:id", protect, todoValidator, updateTodo);
router.delete("/:id", protect, deleteTodo);

export default router;

