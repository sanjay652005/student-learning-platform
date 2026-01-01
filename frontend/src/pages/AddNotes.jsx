import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddNotes = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !semester || !subjectCode || !file) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("semester", semester);
      formData.append("subjectCode", subjectCode);
      formData.append("file", file); // ⚠️ must be "file"

      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      navigate("/notes");
    } catch (err) {
      setError("Failed to upload study material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>➕ Upload Study Material</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* TITLE */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {/* SEMESTER */}
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="">Select Semester</option>
          {[1,2,3,4,5,6,7,8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>

        {/* SUBJECT CODE */}
        <input
          type="text"
          placeholder="Subject Code (e.g. CB968)"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {/* FILE */}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "15px" }}
        />

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Save Study Material"}
        </button>
      </form>
    </div>
  );
};

export default AddNotes;



