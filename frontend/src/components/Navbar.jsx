import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav>
      <h2>Codebase Archaeologist</h2>

      <div>
        <button onClick={() => navigate("/")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/projects")}>
          Projects
        </button>

        <button onClick={() => navigate("/code-analysis")}>
          Code Analysis
        </button>

        <button onClick={() => navigate("/dependencies")}>
          Dependencies
        </button>

        <button onClick={() => navigate("/documentation")}>
          Documentation
        </button>
      </div>
    </nav>
  );
}

export default Navbar;