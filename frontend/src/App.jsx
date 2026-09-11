import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import AddProject from './pages/AddProject';
import ProjectOverview from './pages/ProjectOverview';
import DependencyGraph from './pages/DependencyGraph';
import Documentation from './pages/Documentation';
import CodeExplorer from './pages/CodeExplorer';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Dashboard</Link>{' | '}
        <Link to="/projects">Projects</Link>{' | '}
        <Link to="/projects/new">Add Project</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/new" element={<AddProject />} />
        <Route path="/projects/:id" element={<ProjectOverview />} />
        <Route path="/projects/:id/dependencies" element={<DependencyGraph />} />
        <Route path="/projects/:id/documentation" element={<Documentation />} />
        <Route path="/projects/:id/explorer" element={<CodeExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;