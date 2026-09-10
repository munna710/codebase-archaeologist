function Dependencies() {
  return (
    <div className="dependencies">

      <h1>Dependency Analysis</h1>

      <p className="page-description">
        Explore the relationships between classes and files in your project.
      </p>

      <div className="dependency-layout">

        {/* Dependency Graph */}
        <div className="dependency-graph">

          <h2>Dependency Graph</h2>

          <div className="graph-area">

            <div className="dependency-node node-user">
              User
            </div>

            <div className="dependency-node node-service">
              UserService
            </div>

            <div className="dependency-node node-repository">
              UserRepository
            </div>

            <div className="dependency-node node-database">
              Database
            </div>

            <div className="dependency-node node-payment">
              Payment
            </div>

            <div className="connection connection-one"></div>
            <div className="connection connection-two"></div>
            <div className="connection connection-three"></div>
            <div className="connection connection-four"></div>

          </div>

        </div>

        {/* Dependency Details */}
        <div className="dependency-details">

          <h2>Dependency Details</h2>

          <div className="detail-item">
            <span>Selected Class</span>
            <strong>UserService</strong>
          </div>

          <div className="detail-item">
            <span>Depends On</span>
            <strong>3 Classes</strong>
          </div>

          <div className="detail-item">
            <span>Used By</span>
            <strong>2 Classes</strong>
          </div>

          <h3>Dependencies</h3>

          <ul>
            <li>UserRepository</li>
            <li>User</li>
            <li>Database</li>
          </ul>

        </div>

      </div>

    </div>
  );
}

export default Dependencies;