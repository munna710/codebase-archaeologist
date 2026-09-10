import { useState } from "react";
function Documentation() {
    const [selectedFile, setSelectedFile] = useState("UserService");

    
  return (
    <div className="documentation">

      <h1>AI Documentation</h1>

      <p className="page-description">
        View automatically generated documentation for your codebase.
      </p>

      <div className="documentation-layout">

        <div className="documentation-list">

          <h2>Generated Documentation</h2>

          <div className="doc-item">
            <h3>User.java</h3>
            <p>
              Represents a user in the application and manages user information.
            </p>
            <button onClick={() => setSelectedFile("User")}>
  View Documentation
</button>
          </div>

          <div className="doc-item">
            <h3>UserService.java</h3>
            <p>
              Provides services for creating, updating and retrieving users.
            </p>
            <button onClick={() => setSelectedFile("UserService")} >View Documentation</button>
          </div>

          <div className="doc-item">
            <h3>Database.java</h3>
            <p>
              Handles database connection and database-related operations.
            </p>
            <button onClick={() => setSelectedFile("Database")}>
  View Documentation
</button>
          </div>

        </div>

        <div className="documentation-preview">

         <h2>Documentation Preview</h2>

<h3>{selectedFile}</h3>

{selectedFile === "User" && (
  <>
    <p>
      <strong>Purpose:</strong>
    </p>

    <p>
      Represents a user in the application and stores user information.
    </p>

    <p>
      <strong>Methods:</strong>
    </p>

    <ul>
      <li>getUser()</li>
      <li>setUser()</li>
      <li>updateUser()</li>
    </ul>
  </>
)}

{selectedFile === "UserService" && (
  <>
    <p>
      <strong>Purpose:</strong>
    </p>

    <p>
      The UserService class manages business logic related to users.
    </p>

    <p>
      <strong>Methods:</strong>
    </p>

    <ul>
      <li>createUser()</li>
      <li>getUser()</li>
      <li>updateUser()</li>
      <li>deleteUser()</li>
    </ul>

    <p>
      <strong>Dependencies:</strong>
    </p>

    <ul>
      <li>UserRepository</li>
      <li>Database</li>
    </ul>
  </>
)}

{selectedFile === "Database" && (
  <>
    <p>
      <strong>Purpose:</strong>
    </p>

    <p>
      Handles database connections and database-related operations.
    </p>

    <p>
      <strong>Methods:</strong>
    </p>

    <ul>
      <li>connect()</li>
      <li>disconnect()</li>
      <li>executeQuery()</li>
    </ul>
  </>
)}
        </div>

      </div>

    </div>
  );
}

export default Documentation;