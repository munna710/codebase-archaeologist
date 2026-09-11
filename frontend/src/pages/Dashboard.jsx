import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/dashboard';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError('Failed to load dashboard stats. Is the backend running?'));
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!stats) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <p>Projects: {stats.totalProjects}</p>
        <p>Files: {stats.totalFiles}</p>
        <p>Classes: {stats.totalClasses}</p>
        <p>Methods: {stats.totalMethods}</p>
        <p>Dependencies: {stats.totalDependencies}</p>
      </div>
    </div>
  );
}

export default Dashboard;