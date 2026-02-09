import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '📅', label: 'Matches' },
  { path: '/competitions', icon: '🏆', label: 'Competitions' },
  { path: '/teams', icon: '👥', label: 'Teams' },
  { path: '/favorites', icon: '⭐', label: 'Favorites' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">⚽</div>
        <span className="logo-text">DataCenter</span>
      </div>

      <nav className="nav-items">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="nav-divider" />

      <nav className="nav-items">
        <Link
          to="/settings"
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <Link to={user ? '/favorites' : '/login'} className="user-item">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Guest'}</div>
            <div className="user-role">{user ? 'View profile' : 'Sign in'}</div>
          </div>
        </Link>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: rgba(3, 7, 18, 0.98);
          border-right: 1px solid rgba(6, 182, 212, 0.1);
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(20px);
          z-index: 100;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .sidebar:hover {
          width: var(--sidebar-expanded);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          margin-bottom: 32px;
          white-space: nowrap;
        }

        .logo-icon {
          min-width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 20px var(--cyan-glow);
        }

        .logo-text {
          font-size: 16px;
          font-weight: 700;
          opacity: 0;
          transition: opacity 0.2s ease 0.1s;
        }

        .sidebar:hover .logo-text {
          opacity: 1;
        }

        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          text-decoration: none;
          color: inherit;
        }

        .nav-item:hover {
          background: var(--cyan-bg);
        }

        .nav-item.active {
          background: rgba(6, 182, 212, 0.15);
        }

        .nav-icon {
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: var(--text-muted);
          transition: color 0.2s ease;
        }

        .nav-item:hover .nav-icon,
        .nav-item.active .nav-icon {
          color: var(--cyan-light);
        }

        .nav-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          opacity: 0;
          transition: opacity 0.2s ease 0.1s;
        }

        .sidebar:hover .nav-label {
          opacity: 1;
        }

        .nav-item:hover .nav-label,
        .nav-item.active .nav-label {
          color: #fff;
        }

        .nav-divider {
          height: 1px;
          background: rgba(6, 182, 212, 0.1);
          margin: 12px 12px;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding: 12px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }

        .user-item:hover {
          background: var(--cyan-bg);
        }

        .user-avatar {
          min-width: 36px;
          height: 36px;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .user-info {
          opacity: 0;
          transition: opacity 0.2s ease 0.1s;
          white-space: nowrap;
        }

        .sidebar:hover .user-info {
          opacity: 1;
        }

        .user-name {
          font-size: 13px;
          font-weight: 500;
        }

        .user-role {
          font-size: 11px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
