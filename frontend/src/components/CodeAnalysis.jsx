function CodeAnalysis() {
  return (
    <div className="code-analysis">

      <h1>Code Analysis</h1>

      <p className="page-description">
        View the analysis results of your project code.
      </p>

      {/* Summary */}
      <div className="analysis-cards">

        <div className="analysis-card">
          <h3>Total Files</h3>
          <h2>24</h2>
        </div>

        <div className="analysis-card">
          <h3>Classes</h3>
          <h2>12</h2>
        </div>

        <div className="analysis-card">
          <h3>Methods</h3>
          <h2>48</h2>
        </div>

        <div className="analysis-card">
          <h3>Issues</h3>
          <h2>7</h2>
        </div>

      </div>

      {/* File Analysis */}
      <div className="analysis-results">

        <h2>File Analysis</h2>

        <table>

          <thead>
            <tr>
              <th>File Name</th>
              <th>Language</th>
              <th>Classes</th>
              <th>Methods</th>
              <th>Complexity</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>User.java</td>
              <td>Java</td>
              <td>1</td>
              <td>8</td>
              <td>Low</td>
            </tr>

            <tr>
              <td>UserService.java</td>
              <td>Java</td>
              <td>1</td>
              <td>12</td>
              <td>Medium</td>
            </tr>

            <tr>
              <td>Database.java</td>
              <td>Java</td>
              <td>1</td>
              <td>10</td>
              <td>High</td>
            </tr>

            <tr>
              <td>Payment.java</td>
              <td>Java</td>
              <td>1</td>
              <td>6</td>
              <td>Medium</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default CodeAnalysis;