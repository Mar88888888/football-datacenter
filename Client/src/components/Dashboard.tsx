import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FavouritesContext } from '../context/PreferencesContext';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { favTeams, favComps, loading, removeFavTeam, removeFavComp } = useContext(FavouritesContext);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner message="Loading your favorites..." />;
  }

  return (
    <div className="favorites-page">
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Favorites</h1>
          {user && <span className="user-greeting">Welcome, {user.name}</span>}
        </div>
        <div className="topbar-right">
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="content">
        {/* Favorite Teams */}
        <div className="favorites-section">
          <div className="section-title">Favorite Teams</div>
          {favTeams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">&#128101;</div>
              <p>
                No favorite teams yet.{' '}
                <Link to="/competitions">Browse teams</Link> to add some!
              </p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favTeams.map((team) => (
                <div key={team.id} className="fav-card">
                  <Link to={`/teams/${team.id}`} className="fav-card-img">
                    {team.crest && <img src={team.crest} alt={team.name} />}
                  </Link>
                  <Link to={`/teams/${team.id}`} className="fav-card-info">
                    <div className="fav-card-name">{team.name}</div>
                    <div className="fav-card-meta">Team</div>
                  </Link>
                  <button
                    className="fav-remove"
                    onClick={() => removeFavTeam(team.id)}
                    title="Remove from favorites"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Competitions */}
        <div className="favorites-section">
          <div className="section-title">Favorite Competitions</div>
          {favComps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">&#127942;</div>
              <p>
                No favorite competitions yet.{' '}
                <Link to="/competitions">Browse competitions</Link> to add some!
              </p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favComps.map((comp) => (
                <div key={comp.id} className="fav-card">
                  <Link to={`/competitions/${comp.id}`} className="fav-card-img">
                    {comp.emblem && <img src={comp.emblem} alt={comp.name} />}
                  </Link>
                  <Link to={`/competitions/${comp.id}`} className="fav-card-info">
                    <div className="fav-card-name">{comp.name}</div>
                    <div className="fav-card-meta">Competition</div>
                  </Link>
                  <button
                    className="fav-remove"
                    onClick={() => removeFavComp(comp.id)}
                    title="Remove from favorites"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .favorites-page {
          min-height: 100vh;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 16px 32px;
          background: rgba(3, 7, 18, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-title {
          font-size: 22px;
          font-weight: 700;
        }

        .user-greeting {
          font-size: 14px;
          color: var(--text-muted);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-logout {
          padding: 10px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #f87171;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .content {
          padding: 28px 32px;
        }

        .favorites-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .fav-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .fav-card:hover {
          background: rgba(6, 182, 212, 0.05);
          border-color: var(--cyan-border);
        }

        .fav-card-img {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          flex-shrink: 0;
          text-decoration: none;
          color: inherit;
        }

        .fav-card-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .fav-card-info {
          flex: 1;
          min-width: 0;
          text-decoration: none;
          color: inherit;
        }

        .fav-card-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fav-card-meta {
          font-size: 12px;
          color: var(--text-muted);
        }

        .fav-remove {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: #f87171;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .fav-remove:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state p {
          font-size: 14px;
        }

        .empty-state a {
          color: var(--cyan-light);
          text-decoration: none;
        }

        .empty-state a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .topbar {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .content {
            padding: 16px;
          }

          .favorites-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
