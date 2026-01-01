import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <div className="home-card">
        <h1>📘 Welcome to Study App</h1>

        <p className="home-subtitle">
          Access study materials and previous year question papers in one place.
        </p>

        <ul className="home-features">
          <li>📚 Browse Notes</li>
          <li>📄 View Question Papers</li>
          <li>⬇️ Secure Downloads</li>
        </ul>

        <div className="home-actions">
          <button onClick={() => navigate("/notes")}>
            📚 Explore Notes
          </button>

          <button onClick={() => navigate("/question-papers")}>
            📄 Question Papers
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
