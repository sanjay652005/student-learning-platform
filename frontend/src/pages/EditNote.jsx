import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoteById, updateNote } from "../services/noteService";

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch note by ID
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        setError("");

        const note = await getNoteById(id);
        setTitle(note.title || "");
        setContent(note.content || "");
      } catch (err) {
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  // 🔹 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await updateNote(id, {
        title: title.trim(),
        content: content.trim(),
      });

      navigate("/notes");
    } catch (err) {
      setError("Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>✏️ Edit Note</h2>

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            style={{ width: "100%", padding: "8px" }}
          />

          <br /><br />

          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            rows={5}
            style={{ width: "100%", padding: "8px" }}
          />

          <br /><br />

          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
          >
            {loading ? "Updating..." : "Update Note"}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditNote;
