import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import '../theme.css';
import './navbar.css';

// Change these paths to match your routes.
const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/add-project', label: 'Add project' },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to={LINKS[0].to} className="topbar-brand" onClick={() => setOpen(false)}>
          Codebase Archaeologist
        </NavLink>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm topbar-toggle"
          aria-expanded={open}
          aria-controls="topbar-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="topbar-menu" className={`topbar-menu ${open ? 'is-open' : ''}`} aria-label="Main">
          <ul className="topbar-links">
            {LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `topbar-link ${isActive ? 'is-active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;