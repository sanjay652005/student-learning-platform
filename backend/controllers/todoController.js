import Todo from "../models/Todo.js";

// ➕ Create Todo
// POST /api/todos
export const createTodo = async (req, res) => {
  try {
    const { title, completed } = req.body;

    const todo = await Todo.create({
      title,
      completed: completed || false,
      user: req.user._id, // ownership
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get all Todos (user specific)
// GET /api/todos
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Get single Todo
// GET /api/todos/:id
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Todo
// PUT /api/todos/:id
export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.title = req.body.title ?? todo.title;
    todo.completed = req.body.completed ?? todo.completed;

    const updatedTodo = await todo.save();
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Todo
// DELETE /api/todos/:id
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await todo.deleteOne();
    res.status(200).json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
