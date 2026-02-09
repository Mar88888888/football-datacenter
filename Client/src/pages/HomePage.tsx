import React, { useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { PreferencesContext } from '../context/PreferencesContext';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Match } from '../types';

const LIVE_STATUSES = ['IN_PLAY', 'PAUSED', 'HALF_TIME'];

type DateOffset = -1 | 0 | 1;

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { favTeams, favComps, hiddenComps } = useContext(PreferencesContext);
  const [dateOffset, setDateOffset] = useState<DateOffset>(0);

  const getDateString = (offset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const selectedDate = getDateString(dateOffset);

  const {
    data: matchesData,
    loading,
    error,
  } = useApi<Match[]>(`${API_ENDPOINTS.MATCHES}?date=${selectedDate}`);

  const matches = matchesData || [];

  // Create sets for quick lookup
  const favTeamIds = useMemo(() => new Set(favTeams.map((t) => t.id)), [favTeams]);
  const favCompIds = useMemo(() => new Set(favComps.map((c) => c.id)), [favComps]);
  const hiddenCompIds = useMemo(() => new Set(hiddenComps.map((c) => c.id)), [hiddenComps]);

  // Filter out matches from hidden competitions
  const visibleMatches = useMemo(() => {
    if (hiddenCompIds.size === 0) return matches;
    return matches.filter((m) => !m.competition?.id || !hiddenCompIds.has(m.competition.id));
  }, [matches, hiddenCompIds]);

  // Categorize matches
  const { favouriteMatches, favCompMatches, otherMatchesByComp } = useMemo(() => {
    const favourites: Match[] = [];
    const favCompMatchesMap: Record<number, { competition: Match['competition']; matches: Match[] }> = {};
    const otherMap: Record<number, { competition: Match['competition']; matches: Match[] }> = {};

    visibleMatches.forEach((match) => {
      const compId = match.competition?.id;
      if (!compId) return;

      const isTeamFav =
        favTeamIds.has(match.homeTeam.id) || favTeamIds.has(match.awayTeam.id);
      const isCompFav = favCompIds.has(compId);

      if (isTeamFav) {
        // Matches with favourite teams go to Favourites section
        favourites.push(match);
      } else if (isCompFav) {
        // Matches from favourite competitions (but not favourite teams)
        if (!favCompMatchesMap[compId]) {
          favCompMatchesMap[compId] = { competition: match.competition, matches: [] };
        }
        favCompMatchesMap[compId].matches.push(match);
      } else {
        // All other matches
        if (!otherMap[compId]) {
          otherMap[compId] = { competition: match.competition, matches: [] };
        }
        otherMap[compId].matches.push(match);
      }
    });

    return {
      favouriteMatches: favourites,
      favCompMatches: Object.values(favCompMatchesMap),
      otherMatchesByComp: Object.values(otherMap),
    };
  }, [visibleMatches, favTeamIds, favCompIds]);

  const liveCount = visibleMatches.filter((m) => LIVE_STATUSES.includes(m.status)).length;

  const formatDisplayDate = (offset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="matches-page">
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Matches</h1>
          <div className="tab-nav">
            <button
              className={`tab-item ${dateOffset === -1 ? 'active' : ''}`}
              onClick={() => setDateOffset(-1)}
            >
              Yesterday
            </button>
            <button
              className={`tab-item ${dateOffset === 0 ? 'active' : ''}`}
              onClick={() => setDateOffset(0)}
            >
              Today
            </button>
            <button
              className={`tab-item ${dateOffset === 1 ? 'active' : ''}`}
              onClick={() => setDateOffset(1)}
            >
              Tomorrow
            </button>
          </div>
        </div>
        <div className="topbar-right">
          {user ? (
            <Link to="/favorites" className="btn-primary">
              My Favorites
            </Link>
          ) : (
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div className="content">
        <div className="content-header">
          <h2>
            {formatDisplayDate(dateOffset)}
            {liveCount > 0 && <span className="live-badge">{liveCount} LIVE</span>}
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading matches..." />
        ) : visibleMatches.length === 0 ? (
          <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No matches scheduled for this day</p>
          </div>
        ) : (
          <>
            {/* Favourite Teams Matches */}
            {favouriteMatches.length > 0 && (
              <div className="match-group">
                <div className="match-group-header favourites">
                  <span className="fav-icon">★</span>
                  <Link to="/favorites" className="match-group-title">Favourites</Link>
                  <span className="match-group-count">
                    {favouriteMatches.length} {favouriteMatches.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                <div className="glass">
                  <div className="match-list">
                    {favouriteMatches.map((match) => (
                      <MatchCard key={match.id} match={match} showCompetition />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Favourite Competitions Matches */}
            {favCompMatches.map(({ competition, matches: compMatches }) => (
              <div key={competition?.id} className="match-group">
                <div className="match-group-header">
                  {competition?.emblem && (
                    <img src={competition.emblem} alt={competition.name} />
                  )}
                  <Link to={`/competitions/${competition?.id}`} className="match-group-title">
                    {competition?.name}
                  </Link>
                  <span className="fav-badge">★</span>
                  <span className="match-group-count">
                    {compMatches.length} {compMatches.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                <div className="glass">
                  <div className="match-list">
                    {compMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Other Competitions */}
            {otherMatchesByComp.map(({ competition, matches: compMatches }) => (
              <div key={competition?.id} className="match-group">
                <div className="match-group-header">
                  {competition?.emblem && (
                    <img src={competition.emblem} alt={competition.name} />
                  )}
                  <Link to={`/competitions/${competition?.id}`} className="match-group-title">
                    {competition?.name}
                  </Link>
                  <span className="match-group-count">
                    {compMatches.length} {compMatches.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                <div className="glass">
                  <div className="match-list">
                    {compMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        .matches-page {
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
          gap: 24px;
        }

        .page-title {
          font-size: 22px;
          font-weight: 700;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .content {
          padding: 28px 32px;
          max-width: 700px;
          margin: 0 auto;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .content-header h2 {
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .match-group {
          margin-bottom: 32px;
        }

        .match-group-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-primary);
        }

        .match-group-header img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 2px;
        }

        .match-group-title {
          font-size: 14px;
          font-weight: 600;
          color: inherit;
          text-decoration: none;
        }

        .match-group-title:hover {
          color: var(--cyan-light);
        }

        .match-group-count {
          font-size: 12px;
          color: var(--text-muted);
          margin-left: auto;
        }

        .match-group-header.favourites {
          border-bottom-color: rgba(250, 204, 21, 0.3);
        }

        .fav-icon {
          color: var(--yellow-draw);
          font-size: 18px;
        }

        .fav-badge {
          color: var(--yellow-draw);
          font-size: 12px;
        }

        .match-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .topbar {
            padding: 12px 16px;
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .topbar-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
