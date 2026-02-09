import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Competition, Standings, TeamMinimal } from '../types';

const TeamsListPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCompId, setSelectedCompId] = useState<number | null>(null);

  const {
    data: competitions,
    loading: compsLoading,
    error: compsError,
  } = useApi<Competition[]>(API_ENDPOINTS.COMPETITIONS);

  // Filter to only leagues (cups don't have standard standings)
  const leagues = competitions?.filter((c) => c.type === 'LEAGUE') || [];

  // Set initial selected competition
  useEffect(() => {
    if (leagues.length > 0 && selectedCompId === null) {
      setSelectedCompId(leagues[0].id);
    }
  }, [leagues, selectedCompId]);

  const {
    data: standingsData,
    loading: standingsLoading,
    error: standingsError,
  } = useApi<Standings>(
    selectedCompId ? API_ENDPOINTS.STANDINGS(selectedCompId) : null
  );

  // Extract teams from standings
  const teams: TeamMinimal[] = [];
  if (standingsData?.standings) {
    const seen = new Set<number>();
    standingsData.standings.forEach((group) => {
      group.table.forEach((entry) => {
        if (!seen.has(entry.team.id)) {
          seen.add(entry.team.id);
          teams.push(entry.team);
        }
      });
    });
  }

  const selectedComp = leagues.find((c) => c.id === selectedCompId);

  if (compsError || standingsError) {
    return <ErrorPage />;
  }

  return (
    <div className="teams-page">
      <header className="topbar">
        <h1 className="page-title">Teams</h1>
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
{compsLoading ? (
          <LoadingSpinner message="Loading competitions..." />
        ) : (
          <>
            <div className="comp-selector">
              {leagues.map((comp) => (
                <button
                  key={comp.id}
                  className={`comp-btn ${selectedCompId === comp.id ? 'active' : ''}`}
                  onClick={() => setSelectedCompId(comp.id)}
                >
                  {comp.emblem && <img src={comp.emblem} alt={comp.code} />}
                  {comp.name}
                </button>
              ))}
            </div>

            {selectedComp && (
              <div className="section-title">{selectedComp.name} Teams</div>
            )}

            {standingsLoading ? (
              <LoadingSpinner message="Loading teams..." />
            ) : teams.length === 0 ? (
              <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  No teams found for this competition
                </p>
              </div>
            ) : (
              <div className="teams-grid">
                {teams.map((team) => (
                  <Link key={team.id} to={`/teams/${team.id}`} className="team-card">
                    <div className="team-card-crest">
                      {team.crest && <img src={team.crest} alt={team.name} />}
                    </div>
                    <div className="team-card-name">{team.name}</div>
                    {team.tla && <div className="team-card-tla">{team.tla}</div>}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .teams-page {
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

        .comp-selector {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .comp-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-primary);
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-muted);
          font-family: inherit;
        }

        .comp-btn:hover {
          background: var(--cyan-bg);
          border-color: rgba(6, 182, 212, 0.2);
          color: #fff;
        }

        .comp-btn.active {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.3);
          color: var(--cyan-light);
        }

        .comp-btn img {
          width: 20px;
          height: 20px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 2px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-muted);
        }

        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .team-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .team-card:hover {
          background: var(--cyan-bg);
          border-color: rgba(6, 182, 212, 0.2);
          transform: translateY(-2px);
        }

        .team-card-crest {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          margin-bottom: 12px;
        }

        .team-card-crest img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .team-card-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .team-card-tla {
          font-size: 11px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .topbar {
            padding: 12px 16px;
          }

          .content {
            padding: 16px;
          }

          .teams-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default TeamsListPage;
