import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PreferencesContext } from '../context/PreferencesContext';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Competition, HiddenCompetition } from '../types';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { hiddenComps, hideComp, showComp, isHiddenComp, loading: prefsLoading } = useContext(PreferencesContext);
  const { data: competitions, loading: compsLoading, error } = useApi<Competition[]>(API_ENDPOINTS.COMPETITIONS);
  const [toggling, setToggling] = useState<number | null>(null);

  const handleToggle = async (competition: Competition): Promise<void> => {
    if (!user) return;

    const compId = competition.id;
    setToggling(compId);

    try {
      if (isHiddenComp(compId)) {
        await showComp(compId);
      } else {
        const hiddenComp: HiddenCompetition = {
          id: compId,
          name: competition.name,
          emblem: competition.emblem || '',
        };
        await hideComp(hiddenComp);
      }
    } catch (err) {
      console.error('Error toggling competition visibility:', err);
      alert((err as Error).message || 'An error occurred. Please try again.');
    } finally {
      setToggling(null);
    }
  };

  if (error) {
    return <ErrorPage />;
  }

  const loading = compsLoading || prefsLoading;

  return (
    <div className="settings-page">
      <header className="topbar">
        <h1 className="page-title">Settings</h1>
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
        {!user ? (
          <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Sign in to customize your settings
            </p>
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <LoadingSpinner message="Loading settings..." />
        ) : (
          <>
            <div className="settings-section">
              <div className="section-header">
                <div className="section-title">Hidden Competitions</div>
                <div className="section-description">
                  Toggle off competitions you don't want to see on the Matches page
                </div>
              </div>

              {hiddenComps.length > 0 && (
                <div className="hidden-summary">
                  {hiddenComps.length} competition{hiddenComps.length !== 1 ? 's' : ''} hidden
                </div>
              )}

              <div className="comp-list">
                {competitions?.map((competition) => {
                  const isHidden = isHiddenComp(competition.id);
                  const isToggling = toggling === competition.id;

                  return (
                    <div key={competition.id} className={`comp-item ${isHidden ? 'hidden' : ''}`}>
                      <div className="comp-item-info">
                        <div className="comp-emblem">
                          {competition.emblem && (
                            <img src={competition.emblem} alt={competition.name} />
                          )}
                        </div>
                        <div className="comp-details">
                          <div className="comp-name">{competition.name}</div>
                          <div className="comp-meta">
                            {competition.area?.name && (
                              <span className="comp-area">{competition.area.name}</span>
                            )}
                            <span className="comp-type">{competition.type}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className={`toggle-btn ${!isHidden ? 'active' : ''} ${isToggling ? 'loading' : ''}`}
                        onClick={() => handleToggle(competition)}
                        disabled={isToggling}
                        title={isHidden ? 'Show on Matches page' : 'Hide from Matches page'}
                      >
                        <span className="toggle-track">
                          <span className="toggle-thumb" />
                        </span>
                        <span className="toggle-label">{isHidden ? 'Hidden' : 'Visible'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .settings-page {
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
          max-width: 800px;
          margin: 0 auto;
        }

        .settings-section {
          margin-bottom: 40px;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .section-description {
          font-size: 13px;
          color: var(--text-muted);
        }

        .hidden-summary {
          display: inline-block;
          padding: 6px 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 6px;
          font-size: 12px;
          color: #f87171;
          margin-bottom: 16px;
        }

        .comp-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comp-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .comp-item.hidden {
          opacity: 0.6;
        }

        .comp-item:hover {
          background: rgba(6, 182, 212, 0.03);
        }

        .comp-item-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .comp-emblem {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          flex-shrink: 0;
        }

        .comp-emblem img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .comp-details {
          flex: 1;
          min-width: 0;
        }

        .comp-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .comp-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .comp-area::after {
          content: '·';
          margin-left: 8px;
        }

        .comp-type {
          text-transform: capitalize;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .toggle-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .toggle-btn.loading .toggle-thumb {
          animation: pulse 0.6s infinite alternate;
        }

        @keyframes pulse {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }

        .toggle-track {
          position: relative;
          width: 36px;
          height: 20px;
          background: rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        .toggle-btn.active .toggle-track {
          background: rgba(34, 197, 94, 0.3);
        }

        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: #f87171;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .toggle-btn.active .toggle-thumb {
          left: 18px;
          background: #22c55e;
        }

        .toggle-label {
          font-size: 12px;
          color: var(--text-muted);
          width: 50px;
        }

        @media (max-width: 768px) {
          .topbar {
            padding: 12px 16px;
          }

          .content {
            padding: 16px;
          }

          .comp-item {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .toggle-btn {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
