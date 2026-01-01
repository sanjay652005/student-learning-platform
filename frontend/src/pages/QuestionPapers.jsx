import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionPapers } from "../services/questionPaperService";

const QuestionPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const data = await getQuestionPapers();
        setPapers(Array.isArray(data) ? data : []);
      } catch {
        setError("Unable to load question papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  return (
    <div className="app-container">
      <h2>📄 Question Papers</h2>

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

              {/* ⬇️ Download handled inside details */}
              <button
                onClick={() =>
                  navigate(`/question-papers/${paper._id}`)
                }
              >
                ⬇️ Download 🔒
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default QuestionPapers;



