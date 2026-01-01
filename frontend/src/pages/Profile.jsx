import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [myNotes, setMyNotes] = useState([]);
  const [myPapers, setMyPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔴 GUARD: If no token, redirect
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // 🔹 Fetch profile + uploads
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileRes, notesRes, papersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users/profile", { headers }),
        axios.get("http://localhost:5000/api/notes/my", { headers }),
        axios.get(
          "http://localhost:5000/api/question-papers/my",
          { headers }
        ),
      ]);

      setUser(profileRes.data);
      setMyNotes(notesRes.data || []);
      setMyPapers(papersRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // 🟥 Open delete modal
  const openDeleteModal = (id, type) => {
    setSelectedId(id);
    setDeleteType(type);
    setShowConfirm(true);
  };

  // 🟥 Confirm delete
  const confirmDelete = async () => {
    try {
      const url =
        deleteType === "note"
          ? `http://localhost:5000/api/notes/${selectedId}`
          : `http://localhost:5000/api/question-papers/${selectedId}`;

      await axios.delete(url, { headers });

      if (deleteType === "note") {
        setMyNotes((prev) =>
          prev.filter((n) => n._id !== selectedId)
        );
      } else {
        setMyPapers((prev) =>
          prev.filter((p) => p._id !== selectedId)
        );
      }
    } catch {
      alert("Delete failed");
    } finally {
      setShowConfirm(false);
      setSelectedId(null);
      setDeleteType("");
    }
  };

  // 📊 Stats
  const totalUploads = myNotes.length + myPapers.length;

  // 🕒 Activity
  const activity = [
    ...myNotes.map((n) => ({
      id: n._id,
      title: n.title,
      type: "Study Material",
      date: n.createdAt,
    })),
    ...myPapers.map((p) => ({
      id: p._id,
      title: p.title,
      type: "Question Paper",
      date: p.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // 🔄 UI STATES
  if (loading) {
    return <p style={{ padding: "20px" }}>Loading profile...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: "20px", color: "red" }}>
        {error}
      </p>
    );
  }

  return (
    <div className="app-container">
      <h2>👤 My Profile</h2>

      {/* USER INFO */}
      {user && (
        <div className="card">
          <h3>User Information</h3>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
        </div>
      )}

      {/* STATS */}
      <div className="card">
        <h3>📊 Upload Stats</h3>
        <p>Total uploads: <b>{totalUploads}</b></p>
        <p>Study materials: {myNotes.length}</p>
        <p>Question papers: {myPapers.length}</p>
      </div>

      {/* MY STUDY MATERIALS */}
      <div className="card">
        <h3>📘 My Study Materials</h3>

        {myNotes.length === 0 ? (
          <p>No study materials uploaded.</p>
        ) : (
          myNotes.map((note) => (
            <div key={note._id} style={{ marginBottom: "10px" }}>
              <b>{note.title}</b>
              <div style={{ fontSize: "14px", color: "#555" }}>
                Semester {note.semester} | {note.subjectCode}
              </div>
              <button
                className="danger-btn"
                onClick={() =>
                  openDeleteModal(note._id, "note")
                }
              >
                ❌ Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* MY QUESTION PAPERS */}
      <div className="card">
        <h3>📝 My Question Papers</h3>

        {myPapers.length === 0 ? (
          <p>No question papers uploaded.</p>
        ) : (
          myPapers.map((paper) => (
            <div key={paper._id} style={{ marginBottom: "10px" }}>
              <b>{paper.title}</b>
              <div style={{ fontSize: "14px", color: "#555" }}>
                {paper.year} | {paper.subjectCode}
              </div>
              <button
                className="danger-btn"
                onClick={() =>
                  openDeleteModal(paper._id, "paper")
                }
              >
                ❌ Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="card">
        <h3>🕒 Recent Activity</h3>

        {activity.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          activity.slice(0, 5).map((a) => (
            <p key={a.id}>
              {a.type}: <b>{a.title}</b>
            </p>
          ))
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

