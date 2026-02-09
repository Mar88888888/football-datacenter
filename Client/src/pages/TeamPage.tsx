import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import useFavourite from '../hooks/useFavourite';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Team, Match } from '../types';

const TeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch team data
  const { data: team, loading, error: teamError } = useApi<Team>(API_ENDPOINTS.TEAM(id!));

  // Fetch team matches
  const { data: matchesData, loading: matchesLoading } = useApi<Match[]>(
    API_ENDPOINTS.TEAM_MATCHES(id!)
  );
  const matches = matchesData || [];

  // Favourite management
  const {
    isFavourite,
    loading: favouriteLoading,
    toggleFavourite,
  } = useFavourite('team', id!, team);

  if (loading) {
    return <LoadingSpinner message="Loading team data..." />;
  }

  if (teamError || !team) {
    return <ErrorPage notFound />;
  }

  // Separate matches into recent (finished) and upcoming
  const recentMatches = matches
    .filter((m) => m.status === 'FINISHED')
    .slice(-10)
    .reverse();
  const upcomingMatches = matches
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .slice(0, 5);

  const getMatchResult = (match: Match, teamId: string) => {
    if (match.status !== 'FINISHED') return null;

    const homeScore = match.score.fullTime.home ?? 0;
    const awayScore = match.score.fullTime.away ?? 0;
    const isHome = match.homeTeam.id.toString() === teamId;

    if (homeScore === awayScore) return 'draw';
    if (isHome) return homeScore > awayScore ? 'win' : 'loss';
    return awayScore > homeScore ? 'win' : 'loss';
  };

  const formatDate = (utcDate: string): string => {
    const date = new Date(utcDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="team-page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span>&#8592;</span>
          </button>
          <h1 className="page-title">Team</h1>
        </div>
        <div className="topbar-right">
          {user && (
            <button
              className="btn-secondary"
              onClick={toggleFavourite}
              disabled={favouriteLoading}
            >
              {isFavourite ? '★ Favorited' : '☆ Add to Favorites'}
            </button>
          )}
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
        {/* Team Header */}
        <div className="team-header">
          <div className="team-crest">
            {team.crest && <img src={team.crest} alt={team.name} />}
          </div>
          <div className="team-details">
            <h1>{team.name}</h1>
            <div className="team-meta">
              {team.founded && (
                <div className="team-meta-item">
                  <span className="team-meta-label">Founded</span>
                  <span className="team-meta-value">{team.founded}</span>
                </div>
              )}
              {team.venue && (
                <div className="team-meta-item">
                  <span className="team-meta-label">Stadium</span>
                  <span className="team-meta-value">{team.venue}</span>
                </div>
              )}
              {team.coach?.name && (
                <div className="team-meta-item">
                  <span className="team-meta-label">Coach</span>
                  <span className="team-meta-value">{team.coach.name}</span>
                </div>
              )}
              {team.clubColors && (
                <div className="team-meta-item">
                  <span className="team-meta-label">Colors</span>
                  <span className="team-meta-value">{team.clubColors}</span>
                </div>
              )}
            </div>
            {team.runningCompetitions && team.runningCompetitions.length > 0 && (
              <div className="team-comps">
                {team.runningCompetitions.map((comp) => (
                  <Link
                    key={comp.id}
                    to={`/competitions/${comp.id}`}
                    className="team-comp"
                  >
                    {comp.emblem && <img src={comp.emblem} alt={comp.name} />}
                    {comp.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="page-grid">
          {/* Matches */}
          <div className="glass">
            {matchesLoading ? (
              <LoadingSpinner message="Loading matches..." />
            ) : (
              <>
                <div className="section-title">Recent Matches</div>
                {recentMatches.length === 0 ? (
                  <p className="empty-state">No recent matches</p>
                ) : (
                  <div className="match-list">
                    {recentMatches.map((match) => {
                      const isHome = match.homeTeam.id.toString() === id;
                      const result = getMatchResult(match, id!);
                      return (
                        <Link
                          key={match.id}
                          to={`/matches/${match.id}`}
                          className="match-item"
                        >
                          <div className="match-date">{formatDate(match.utcDate)}</div>
                          <div className="match-comp">
                            {match.competition?.emblem && (
                              <img
                                src={match.competition.emblem}
                                alt={match.competition.name}
                              />
                            )}
                          </div>
                          <div className="match-teams">
                            <div className={`match-team ${isHome ? 'highlight' : ''}`}>
                              {match.homeTeam.crest && (
                                <img src={match.homeTeam.crest} alt={match.homeTeam.name} />
                              )}
                              <span>{match.homeTeam.shortName || match.homeTeam.name}</span>
                            </div>
                            <div className="match-score">
                              {match.score.fullTime.home} : {match.score.fullTime.away}
                            </div>
                            <div className={`match-team away ${!isHome ? 'highlight' : ''}`}>
                              <span>{match.awayTeam.shortName || match.awayTeam.name}</span>
                              {match.awayTeam.crest && (
                                <img src={match.awayTeam.crest} alt={match.awayTeam.name} />
                              )}
                            </div>
                          </div>
                          {result && (
                            <div className={`match-result ${result}`}>
                              {result === 'win' ? 'W' : result === 'draw' ? 'D' : 'L'}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {upcomingMatches.length > 0 && (
                  <>
                    <div className="section-title" style={{ marginTop: '24px' }}>
                      Upcoming
                    </div>
                    <div className="match-list">
                      {upcomingMatches.map((match) => {
                        const isHome = match.homeTeam.id.toString() === id;
                        return (
                          <Link
                            key={match.id}
                            to={`/matches/${match.id}`}
                            className="match-item"
                          >
                            <div className="match-date">{formatDate(match.utcDate)}</div>
                            <div className="match-comp">
                              {match.competition?.emblem && (
                                <img
                                  src={match.competition.emblem}
                                  alt={match.competition.name}
                                />
                              )}
                            </div>
                            <div className="match-teams">
                              <div className={`match-team ${isHome ? 'highlight' : ''}`}>
                                {match.homeTeam.crest && (
                                  <img src={match.homeTeam.crest} alt={match.homeTeam.name} />
                                )}
                                <span>{match.homeTeam.shortName || match.homeTeam.name}</span>
                              </div>
                              <div className="match-score vs">vs</div>
                              <div className={`match-team away ${!isHome ? 'highlight' : ''}`}>
                                <span>{match.awayTeam.shortName || match.awayTeam.name}</span>
                                {match.awayTeam.crest && (
                                  <img src={match.awayTeam.crest} alt={match.awayTeam.name} />
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Team Info */}
          <div className="glass">
            <div className="section-title">Club Info</div>
            <div className="info-grid">
              {team.shortName && (
                <div className="info-item">
                  <div className="info-label">Short Name</div>
                  <div className="info-value">{team.shortName}</div>
                </div>
              )}
              {team.tla && (
                <div className="info-item">
                  <div className="info-label">TLA</div>
                  <div className="info-value">{team.tla}</div>
                </div>
              )}
              {team.address && !team.address.includes('null') && (
                <div className="info-item full-width">
                  <div className="info-label">Address</div>
                  <div className="info-value">{team.address}</div>
                </div>
              )}
              {team.website && (
                <div className="info-item full-width">
                  <div className="info-label">Website</div>
                  <div className="info-value">
                    <a
                      href={team.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {team.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .team-page {
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

        .back-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          cursor: pointer;
          font-size: 18px;
          color: inherit;
        }

        .back-btn:hover {
          background: var(--cyan-bg);
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
        }

        .team-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
          padding: 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
        }

        .team-crest {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          flex-shrink: 0;
        }

        .team-crest img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .team-details {
          flex: 1;
        }

        .team-details h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .team-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          margin-top: 12px;
        }

        .team-meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .team-meta-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .team-meta-value {
          font-size: 14px;
          font-weight: 500;
        }

        .team-comps {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .team-comp {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--cyan-bg);
          border-radius: 8px;
          font-size: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }

        .team-comp:hover {
          background: rgba(6, 182, 212, 0.2);
        }

        .team-comp img {
          width: 16px;
          height: 16px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 2px;
        }

        .page-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title::before {
          content: '';
          width: 3px;
          height: 14px;
          background: linear-gradient(180deg, var(--cyan-primary), var(--cyan-secondary));
          border-radius: 2px;
        }

        .match-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .match-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 10px;
          background: rgba(6, 182, 212, 0.02);
          border: 1px solid rgba(6, 182, 212, 0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }

        .match-item:hover {
          background: rgba(6, 182, 212, 0.05);
        }

        .match-date {
          width: 60px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .match-comp {
          width: 24px;
          height: 24px;
          margin-right: 12px;
        }

        .match-comp img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 2px;
        }

        .match-teams {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .match-team {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .match-team.away {
          justify-content: flex-end;
        }

        .match-team img {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }

        .match-team.highlight {
          font-weight: 600;
        }

        .match-score {
          font-weight: 700;
          font-size: 13px;
          min-width: 40px;
          text-align: center;
        }

        .match-score.vs {
          color: var(--text-muted);
          font-weight: 400;
        }

        .match-result {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          margin-left: 8px;
        }

        .match-result.win {
          background: rgba(34, 197, 94, 0.2);
          color: var(--green-win);
        }

        .match-result.draw {
          background: rgba(250, 204, 21, 0.2);
          color: var(--yellow-draw);
        }

        .match-result.loss {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .info-item {
          padding: 16px;
          background: rgba(6, 182, 212, 0.02);
          border: 1px solid rgba(6, 182, 212, 0.08);
          border-radius: 10px;
        }

        .info-item.full-width {
          grid-column: span 2;
        }

        .info-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 500;
        }

        .website-link {
          color: var(--cyan-light);
          text-decoration: none;
        }

        .website-link:hover {
          text-decoration: underline;
        }

        .empty-state {
          color: var(--text-muted);
          font-size: 14px;
          text-align: center;
          padding: 20px;
        }

        @media (max-width: 1100px) {
          .page-grid {
            grid-template-columns: 1fr;
          }
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

          .team-header {
            flex-direction: column;
            text-align: center;
          }

          .team-meta {
            justify-content: center;
          }

          .team-comps {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TeamPage;
