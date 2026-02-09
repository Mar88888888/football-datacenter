import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Competition } from '../types';

const CompetitionsListPage: React.FC = () => {
  const { user } = useAuth();
  const { data: competitions, loading, error } = useApi<Competition[]>(API_ENDPOINTS.COMPETITIONS);

  const leagues = competitions?.filter((c) => c.type === 'LEAGUE') || [];
  const cups = competitions?.filter((c) => c.type === 'CUP') || [];

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="competitions-page">
      <header className="topbar">
        <h1 className="page-title">Competitions</h1>
        {user ? (
          <Link to="/favorites" className="btn-primary">
            My Favorites
          </Link>
        ) : (
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        )}
      </header>

      <div className="content">
        {loading ? (
          <LoadingSpinner message="Loading competitions..." />
        ) : (
          <>
            {leagues.length > 0 && (
              <>
                <div className="section-title">Leagues</div>
                <div className="comp-grid">
                  {leagues.map((competition) => (
                    <Link
                      key={competition.id}
                      to={`/competitions/${competition.id}`}
                      className="comp-card"
                    >
                      <div className="comp-card-header">
                        <div className="comp-emblem">
                          {competition.emblem && (
                            <img src={competition.emblem} alt={competition.name} />
                          )}
                        </div>
                        <div className="comp-info">
                          <div className="comp-name">{competition.name}</div>
                          <div className="comp-area">
                            {competition.area?.flag && (
                              <img src={competition.area.flag} alt={competition.area.name} />
                            )}
                            {competition.area?.name}
                          </div>
                        </div>
                      </div>
                      {competition.currentSeason?.currentMatchday && (
                        <div className="comp-card-stats">
                          <div className="comp-stat">
                            <div className="comp-stat-value">
                              {competition.currentSeason.currentMatchday}
                            </div>
                            <div className="comp-stat-label">Matchday</div>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {cups.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: 48 }}>
                  Cups
                </div>
                <div className="comp-grid">
                  {cups.map((competition) => (
                    <Link
                      key={competition.id}
                      to={`/competitions/${competition.id}`}
                      className="comp-card"
                    >
                      <div className="comp-card-header">
                        <div className="comp-emblem">
                          {competition.emblem && (
                            <img src={competition.emblem} alt={competition.name} />
                          )}
                        </div>
                        <div className="comp-info">
                          <div className="comp-name">{competition.name}</div>
                          <div className="comp-area">
                            <span className="comp-type-badge">Cup</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {leagues.length === 0 && cups.length === 0 && (
              <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No competitions available</p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .competitions-page {
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

        .page-title {
          font-size: 22px;
          font-weight: 700;
        }

        .content {
          padding: 28px 32px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .comp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .comp-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .comp-card:hover {
          background: var(--cyan-bg);
          border-color: rgba(6, 182, 212, 0.2);
          transform: translateY(-2px);
        }

        .comp-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .comp-card-stats + .comp-card-header {
          margin-bottom: 0;
        }

        .comp-card-header:last-child {
          margin-bottom: 0;
        }

        .comp-emblem {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          flex-shrink: 0;
        }

        .comp-emblem img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .comp-info {
          flex: 1;
          min-width: 0;
        }

        .comp-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .comp-area {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .comp-area img {
          width: 16px;
          height: 12px;
          object-fit: contain;
        }

        .comp-card-stats {
          display: flex;
          gap: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--border-primary);
        }

        .comp-stat {
          text-align: center;
        }

        .comp-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--cyan-light);
        }

        .comp-stat-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .comp-type-badge {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          color: var(--cyan-light);
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .topbar {
            padding: 12px 16px;
          }

          .content {
            padding: 16px;
          }

          .comp-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CompetitionsListPage;
