import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddQuestionPaper = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !year || !subjectCode || !file) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("year", year);
      formData.append("subjectCode", subjectCode);
      formData.append("file", file); // 🔑 multer key

      const res = await fetch(
        "http://localhost:5000/api/question-papers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      navigate("/question-papers");
    } catch (err) {
      setError("Failed to upload question paper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>➕ Upload Question Paper</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* TITLE */}
        <input
          type="text"
          placeholder="Title (e.g. Embedded Systems – Nov 2023)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {/* YEAR */}
        <input
          type="number"
          placeholder="Year (e.g. 2023)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {/* SUBJECT CODE */}
        <input
          type="text"
          placeholder="Subject Code (e.g. CS3691)"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {/* FILE */}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "15px" }}
        />

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Save Question Paper"}
        </button>
      </form>
    </div>
  );
};

export default AddQuestionPaper;
