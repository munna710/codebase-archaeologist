import "./App.css";
import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import CreateProject from "./components/CreateProject";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectDetails from "./components/ProjectDetails";
import CodeAnalysis from "./components/CodeAnalysis";
import Dependencies from "./components/Dependencies";
import Documentation from "./components/Documentation";
import Dashboard from "./components/Dashboard";


function App() {
  return (
     <BrowserRouter>
      <Navbar />

<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/create-project" element={<CreateProject />} />
  <Route path="/project-details" element={<ProjectDetails />} />
  <Route path="/code-analysis" element={<CodeAnalysis />} />
  <Route path="/dependencies" element={<Dependencies />} />
  <Route path="/documentation" element={<Documentation />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;