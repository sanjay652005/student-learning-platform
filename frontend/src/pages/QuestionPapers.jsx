import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getQuestionPapers } from "../services/questionPaperService";

const QuestionPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Backend URL
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // 🔐 Get logged-in user id from token
  const getUserIdFromToken = () => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const userId = getUserIdFromToken();

  // 🔹 Fetch question papers
  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getQuestionPapers({
        search,
        year,
        subjectCode,
      });

      setPapers(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load question papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [search, year, subjectCode]);

  // 🟥 Delete handlers (OWNER ONLY)
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/question-papers/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      setPapers((prev) =>
        prev.filter((p) => p._id !== deleteId)
      );
    } catch {
      alert("Failed to delete question paper");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  // ⬇️ DOWNLOAD (PROTECTED)
  const handleDownload = async (id, title) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/question-papers/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = title || "question-paper";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  return (
    <div className="app-container">
      <h2>📄 Question Papers</h2>

      {/* ➕ Upload (only after login) */}
      {token && (
        <Link to="/add-question-paper">
          <button>➕ Upload Question Paper</button>
        </Link>
      )}

      {/* 🔍 Filters (SAME AS NOTES) */}
      <div className="filter-box">
        <input
          placeholder="Search question papers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ marginTop: "10px" }}>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <input
            placeholder="Subject Code (e.g. CS301)"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            style={{ marginLeft: "1px" }}
          />
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading &&
        papers.map((paper) => (
          <div key={paper._id} className="card">
            <h3>{paper.title}</h3>

            <p>
              <b>Year:</b> {paper.year} |{" "}
              <b>Subject:</b> {paper.subjectCode}
            </p>

            <small>By {paper.user?.name}</small>
            <br />
            <small style={{ color: "#555", fontSize: "13px" }}>
              👁️ {paper.views || 0} views · ⬇️{" "}
              {paper.downloads || 0} downloads
            </small>

            <div className="card-actions">
              {/* 👁️ Preview */}
              <button
                onClick={() =>
                  navigate(`/question-papers/${paper._id}`)
                }
              >
                👁️ View
              </button>

              {/* ⬇️ Download */}
              <button
                onClick={() =>
                  handleDownload(paper._id, paper.title)
                }
              >
                ⬇️ Download 🔒
              </button>

              {/* ❌ Delete (OWNER ONLY) */}
              {paper.user?._id === userId && (
                <button
                  className="danger-btn"
                  onClick={() =>
                    handleDeleteClick(paper._id)
                  }
                >
                  ❌ Delete
                </button>
              )}
            </div>
          </div>
        ))}

      {/* 🧾 DELETE CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Question Paper</h3>
            <p>
              Are you sure you want to delete this question
              paper?
            </p>

            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPapers;
