import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getNotes } from "../services/noteService";

const Notes = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  // 🔹 Fetch notes
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotes({
        search,
        semester,
        subjectCode,
      });

      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, semester, subjectCode]);

  // 🟥 Delete handlers
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notes/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      setMaterials((prev) =>
        prev.filter((m) => m._id !== deleteId)
      );
    } catch {
      alert("Failed to delete study material");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  // ⬇️ DOWNLOAD (FIXED)
  const handleDownload = async (id, title) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/notes/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = title || "study-material";
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
      <h2>📚 Study Materials</h2>

      {token && (
        <Link to="/add-notes">
          <button>➕ Upload Study Material</button>
        </Link>
      )}

      {/* 🔍 Filters */}
      <div className="filter-box">
        <input
          placeholder="Search study materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ marginTop: "10px" }}>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
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
        materials.map((material) => (
          <div key={material._id} className="card">
            <h3>{material.title}</h3>

            <p>
              <b>Semester:</b> {material.semester} |{" "}
              <b>Subject:</b> {material.subjectCode}
            </p>

            <small>By {material.user?.name}</small>
            <br />
            <small style={{ color: "#555", fontSize: "13px" }}>
              👁️ {material.views || 0} views · ⬇️{" "}
              {material.downloads || 0} downloads
            </small>

            <div className="card-actions">
              {/* 👁️ Preview */}
              <button
                onClick={() =>
                  navigate(`/notes/${material._id}`)
                }
              >
                👁️ View
              </button>

              {/* ⬇️ Download (FIXED) */}
              <button
                onClick={() =>
                  handleDownload(
                    material._id,
                    material.title
                  )
                }
              >
                ⬇️ Download 🔒
              </button>

              {/* ❌ Delete (owner only) */}
              {material.user?._id === userId && (
                <button
                  className="danger-btn"
                  onClick={() =>
                    handleDeleteClick(material._id)
                  }
                >
                  ❌ Delete
                </button>
              )}
            </div>
          </div>
        ))}

      {/* DELETE CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Study Material</h3>
            <p>
              Are you sure you want to delete this study
              material?
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

export default Notes;


