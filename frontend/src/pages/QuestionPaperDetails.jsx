import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getQuestionPaperById,
  downloadQuestionPaper,
} from "../services/questionPaperService";

const QuestionPaperDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch question paper preview (PUBLIC)
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await getQuestionPaperById(id);
        setPaper(data);
      } catch (err) {
        setError("Unable to load question paper");
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  // 🔒 Download handler (LOGIN REQUIRED)
  const handleDownload = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setDownloading(true);

      const fileData = await downloadQuestionPaper(id);

      const blob = new Blob([fileData], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = paper?.title || "question-paper";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!paper) return null;

  return (
    <div className="app-container">
      <h2>{paper.title}</h2>

      <p>
        <b>Year:</b> {paper.year}
      </p>

      <p>
        <b>Subject Code:</b> {paper.subjectCode}
      </p>

      <p>
        <b>Uploaded by:</b> {paper.user?.name}
      </p>

      {/* 📄 PDF PREVIEW (NO SAVE / PRINT / TOOLBAR) */}
      <div className="preview-box">
        <iframe
          src={`http://localhost:5000${paper.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
          title="Question Paper Preview"
          width="100%"
          height="500px"
          style={{ border: "none" }}
        />
      </div>

      {/* 🔒 DOWNLOAD BUTTON */}
      <button onClick={handleDownload} disabled={downloading}>
        {downloading ? "Downloading..." : "⬇️ Download 🔒"}
      </button>
    </div>
  );
};

export default QuestionPaperDetails;
