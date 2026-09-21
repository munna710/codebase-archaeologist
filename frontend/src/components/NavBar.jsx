import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../theme.css';
import './navbar.css';

const LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/projects/new', label: 'Add project' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    setOpen(false);
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink
          to="/"
          className="topbar-brand"
          onClick={() => setOpen(false)}
        >
          Codebase Archaeologist
        </NavLink>

        <button
          type="button"
          className="topbar-toggle"
          aria-expanded={open}
          aria-controls="topbar-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          &#9776;
        </button>

        <nav
          id="topbar-menu"
          className={`topbar-menu ${open ? 'is-open' : ''}`}
          aria-label="Main"
        >
          <ul className="topbar-links">
            {LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `topbar-link ${isActive ? 'is-active' : ''}`
                  }
                  onClick={() => setOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            {user && (
              <li className="topbar-user">
                <span className="topbar-username">
                  {user.name}
                </span>
                <button
                  type="button"
                  className="topbar-logout"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;