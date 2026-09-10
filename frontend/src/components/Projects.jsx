import { useNavigate } from "react-router-dom";

function Projects() {
  const navigate = useNavigate();

  return (
    <div className="projects">

      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Manage your codebase projects here.</p>
        </div>

        <button onClick={() => navigate("/create-project")}>
          + Create New Project
        </button>
      </div>

      <div className="project-card">

        <div className="project-info">
          <h2>Sample Project</h2>

          <p>Language: Java</p>

          <span className="status pending">
            Not Analyzed
          </span>
        </div>

        <button onClick={() => navigate("/project-details")}>
          View Project
        </button>

      </div>

    </div>
  );
}

export default Projects;