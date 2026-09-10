import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [language, setLanguage] = useState("");

  const navigate = useNavigate();

  const handleCreateProject = () => {
    if (projectName === "" || language === "") {
      alert("Please enter project name and select a language.");
      return;
    }

    navigate("/project-details", {
      state: {
        projectName: projectName,
        language: language
      }
    });
  };

  return (
    <div className="create-project">

      <h1>Create New Project</h1>

      <input
        type="text"
        placeholder="Enter project name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="">Select language</option>
        <option value="Java">Java</option>
        <option value="Python">Python</option>
        <option value="JavaScript">JavaScript</option>
        <option value="C">C</option>
      </select>

      <button onClick={handleCreateProject}>
        Create Project
      </button>

      <button onClick={() => navigate("/projects")}>
        Cancel
      </button>

    </div>
  );
}

export default CreateProject;