import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import AddProject from './pages/AddProject';
import ProjectOverview from './pages/ProjectOverview';
import DependencyGraph from './pages/DependencyGraph';
import Documentation from './pages/Documentation';
import CodeExplorer from './pages/CodeExplorer';
import ClassDetails from './pages/ClassDetails';
import Chat from './pages/Chat';
import CodeSmells from './pages/CodeSmells';
import Debug from './pages/Debug';
import Commits from './pages/Commits';
import Navbar from './components/Navbar';

function Layout() {
  const location = useLocation();

  const hideNavBar =
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <>
      {!hideNavBar && <Navbar />}
      <AppRoutes />
    </>
  );
}

function NavBar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Dashboard</Link>{' | '}
      <Link to="/projects">Projects</Link>{' | '}
      <Link to="/projects/new">Add Project</Link>
      {user && (
        <span style={{ float: 'right' }}>
          {user.name} · <button onClick={handleLogout} style={{ padding: '0.2rem 0.6rem' }}>Log Out</button>
        </span>
      )}
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectOverview /></ProtectedRoute>} />
      <Route path="/projects/:id/explorer" element={<ProtectedRoute><CodeExplorer /></ProtectedRoute>} />
      <Route path="/projects/:id/classes/:classId" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
      <Route path="/projects/:id/dependencies" element={<ProtectedRoute><DependencyGraph /></ProtectedRoute>} />
      <Route path="/projects/:id/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
      <Route path="/projects/:id/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/projects/:id/code-smells" element={<ProtectedRoute><CodeSmells /></ProtectedRoute>} />
      <Route path="/projects/:id/debug" element={<ProtectedRoute><Debug /></ProtectedRoute>} />
      <Route path="/projects/:id/commits" element={<ProtectedRoute><Commits /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;