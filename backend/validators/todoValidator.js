import { body } from "express-validator";

export const todoValidator = [
  body("title")
    .notEmpty()
    .withMessage("Todo title is required"),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be true or false"),
];
