import { Routes, Route } from "react-router-dom";
import "./App.css";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home"; // ✅ NEW HOME
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import Notes from "./pages/Notes";
import NoteDetails from "./pages/NoteDetails";
import AddNotes from "./pages/AddNotes";
import EditNote from "./pages/EditNote";

import QuestionPapers from "./pages/QuestionPapers";
import QuestionPaperDetails from "./pages/QuestionPaperDetails";
import AddQuestionPaper from "./pages/AddQuestionPaper";

function App() {
  return (
    <Routes>
      {/* 🔓 PUBLIC */}
      <Route element={<MainLayout />}>
        {/* 🏠 HOME */}
        <Route index element={<Home />} />

        {/* 📚 NOTES */}
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id" element={<NoteDetails />} />

        {/* 📄 QUESTION PAPERS */}
        <Route path="/question-papers" element={<QuestionPapers />} />
        <Route
          path="/question-papers/:id"
          element={<QuestionPaperDetails />}
        />

        {/* 🔐 AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* 🔒 PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/add-notes" element={<AddNotes />} />
          <Route path="/edit-note/:id" element={<EditNote />} />
          <Route
            path="/add-question-paper"
            element={<AddQuestionPaper />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;



