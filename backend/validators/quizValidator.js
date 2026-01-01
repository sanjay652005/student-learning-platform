import { body } from "express-validator";

export const quizValidator = [
  body("title")
    .notEmpty()
    .withMessage("Quiz title is required"),

  body("questions")
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),

  body("questions.*.question")
    .notEmpty()
    .withMessage("Question text is required"),

  body("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("At least two options required"),

  body("questions.*.correctAnswer")
    .notEmpty()
    .withMessage("Correct answer is required"),
];
