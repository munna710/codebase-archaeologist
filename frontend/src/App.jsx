import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import AddProject from './pages/AddProject';
import ProjectOverview from './pages/ProjectOverview';
import DependencyGraph from './pages/DependencyGraph';
import Documentation from './pages/Documentation';
import CodeExplorer from './pages/CodeExplorer';
import ClassDetails from './pages/ClassDetails';
import Chat from './pages/Chat';


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
        <Route path="/projects/:id/classes/:classId" element={<ClassDetails />} />
        <Route path="/projects/:id/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;