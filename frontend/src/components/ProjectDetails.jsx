import { useLocation, useNavigate } from "react-router-dom";

function ProjectDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const projectName = location.state?.projectName || "Sample Project";
  const language = location.state?.language || "Java";

  return (
    <div className="project-details">

      <h1>{projectName}</h1>

      <p className="project-language">
        Language: {language}
      </p>

      <div className="upload-section">

        <h2>Upload Codebase</h2>

        <p>
          Upload your project files to begin code analysis.
        </p>

        <input
          type="file"
          webkitdirectory="true"
          directory=""
        />

        <button
          className="analyze-button"
          onClick={() => navigate("/code-analysis")}
        >
          Analyze Code
        </button>

      </div>

      <div className="analysis-summary">

        <h2>Analysis Summary</h2>

        <div className="summary-cards">

          <div className="summary-card">
            <h3>Files</h3>
            <p>0</p>
          </div>

          <div className="summary-card">
            <h3>Classes</h3>
            <p>0</p>
          </div>

          <div className="summary-card">
            <h3>Methods</h3>
            <p>0</p>
          </div>

          <div className="summary-card">
            <h3>Dependencies</h3>
            <p>0</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProjectDetails;