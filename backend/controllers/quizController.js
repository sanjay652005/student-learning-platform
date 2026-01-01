import Quiz from "../models/Quiz.js";

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private
export const createQuiz = async (req, res) => {
  const { title, questions } = req.body;
  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ message: "Title and questions are required" });
  }

  const quiz = await Quiz.create({
    title,
    questions,
    createdBy: req.user._id,
  });

  res.status(201).json(quiz);
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
export const getQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ createdBy: req.user._id });
  res.status(200).json(quizzes);
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  res.status(200).json(quiz);
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private
export const updateQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const { title, questions } = req.body;
  quiz.title = title || quiz.title;
  quiz.questions = questions || quiz.questions;

  const updatedQuiz = await quiz.save();
  res.status(200).json(updatedQuiz);
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await quiz.remove();
  res.status(200).json({ message: "Quiz removed" });
};
