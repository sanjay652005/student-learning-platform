import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoteById, downloadNote } from "../services/noteService";

const NoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNote = async () => {
      const data = await getNoteById(id);
      setNote(data);
      setLoading(false);
    };
    fetchNote();
  }, [id]);

  const handleDownload = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setDownloading(true);
      const fileData = await downloadNote(id);

      const blob = new Blob([fileData], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = note.title || "study-material";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="app-container">
      <h2>{note.title}</h2>

      <p>
        <b>Semester:</b> {note.semester}
      </p>
      <p>
        <b>Subject:</b> {note.subjectCode}
      </p>
      <p>
        <b>Uploaded by:</b> {note.user?.name}
      </p>

      {/* 📄 PDF PREVIEW (NO SAVE / PRINT / TOOLBAR) */}
      <div className="preview-box">
        <iframe
          src={`http://localhost:5000${note.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
          title="PDF Preview"
          width="100%"
          height="500px"
          style={{ border: "none" }}
        />
      </div>

      <button onClick={handleDownload} disabled={downloading}>
        {downloading ? "Downloading..." : "⬇️ Download 🔒"}
      </button>
    </div>
  );
};

export default NoteDetails;
