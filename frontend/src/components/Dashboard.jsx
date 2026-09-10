import { useNavigate } from "react-router-dom";
function Dashboard() {
    const navigate = useNavigate();
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <p>
          Understand, analyze and document your legacy codebase.
        </p>
      </div>

      <div className="stats">

        <div className="stat-card">
          <h3>Total Projects</h3>
          <h2>3</h2>
        </div>

        <div className="stat-card">
          <h3>Total Files</h3>
          <h2>248</h2>
        </div>

        <div className="stat-card">
          <h3>Functions</h3>
          <h2>586</h2>
        </div>

        <div className="stat-card">
          <h3>Issues Found</h3>
          <h2>24</h2>
        </div>

      </div>

      <div className="recent-projects">

        <h2>Recent Projects</h2>

        <div className="dashboard-project">
          <div>
            <h3  onClick={() => navigate("/project-details")}
  style={{ cursor: "pointer" }} >Banking System</h3>
            <p>Java</p>
          </div>

          <span className="status analyzed">
            Analyzed
          </span>
        </div>

        <div className="dashboard-project">
          <div>
            <h3>Library Management</h3>
            <p>Python</p>
          </div>

          <span className="status pending">
            Not Analyzed
          </span>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;