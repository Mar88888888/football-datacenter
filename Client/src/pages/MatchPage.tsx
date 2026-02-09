import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Match, Head2Head } from '../types';

const SCORE_STATUSES = ['IN_PLAY', 'PAUSED', 'HALF_TIME', 'FINISHED'];

const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, { text: string; className: string }> = {
    SCHEDULED: { text: 'Scheduled', className: 'scheduled' },
    TIMED: { text: 'Scheduled', className: 'scheduled' },
    IN_PLAY: { text: 'Live', className: 'live' },
    PAUSED: { text: 'Half Time', className: 'halftime' },
    HALF_TIME: { text: 'Half Time', className: 'halftime' },
    FINISHED: { text: 'Full Time', className: 'finished' },
    POSTPONED: { text: 'Postponed', className: 'scheduled' },
    CANCELLED: { text: 'Cancelled', className: 'scheduled' },
    SUSPENDED: { text: 'Suspended', className: 'scheduled' },
  };
  return statusMap[status] || { text: status, className: 'scheduled' };
};

const formatStage = (stage?: string): string => {
  if (!stage) return 'Regular Season';
  return stage
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDateTime = (utcDate: string): string => {
  const date = new Date(utcDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (utcDate: string): string => {
  const date = new Date(utcDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: match,
    loading: matchLoading,
    error: matchError,
  } = useApi<Match>(API_ENDPOINTS.MATCH(id || ''));

  const {
    data: h2h,
    loading: h2hLoading,
  } = useApi<Head2Head>(API_ENDPOINTS.MATCH_HEAD2HEAD(id || ''));

  const loading = matchLoading || h2hLoading;

  if (loading) {
    return <LoadingSpinner message="Loading match details..." />;
  }

  if (matchError || !match) {
    return <ErrorPage notFound />;
  }

  const statusDisplay = getStatusDisplay(match.status);
  const showScore = SCORE_STATUSES.includes(match.status);

  return (
    <div className="match-page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span>&#8592;</span>
          </button>
          <Link to={`/competitions/${match.competition?.id}`} className="topbar-comp">
            {match.competition?.emblem && (
              <img src={match.competition.emblem} alt={match.competition.name} />
            )}
            <div className="topbar-comp-info">
              <span className="topbar-comp-name">{match.competition?.name}</span>
              <span className="topbar-comp-meta">
                {match.matchday ? `Matchday ${match.matchday}` : formatStage(match.stage)}
              </span>
            </div>
          </Link>
        </div>
        {user ? (
          <Link to="/favorites" className="btn-primary">My Favorites</Link>
        ) : (
          <Link to="/login" className="btn-primary">Sign In</Link>
        )}
      </header>

      <div className="content">
        {/* Match Hero */}
        <div className="match-hero">
          <div className="match-status-bar">
            <span className={`match-status ${statusDisplay.className}`}>
              {statusDisplay.text}
            </span>
            <span className="match-datetime">{formatDateTime(match.utcDate)}</span>
          </div>

          <div className="match-teams-display">
            {match.homeTeam?.id ? (
              <Link to={`/teams/${match.homeTeam.id}`} className="match-team clickable">
                <div className="match-team-crest">
                  {match.homeTeam.crest ? (
                    <img src={match.homeTeam.crest} alt={match.homeTeam.name} />
                  ) : (
                    <span>{match.homeTeam.tla || '???'}</span>
                  )}
                </div>
                <div className="match-team-name">{match.homeTeam.name || 'TBD'}</div>
                <div className="match-team-tla">{match.homeTeam.tla}</div>
              </Link>
            ) : (
              <div className="match-team">
                <div className="match-team-crest">
                  <span>???</span>
                </div>
                <div className="match-team-name">TBD</div>
                <div className="match-team-tla"></div>
              </div>
            )}

            <div className="match-score-display">
              {showScore ? (
                <>
                  <div className="match-score-main">
                    {match.score.fullTime.home} - {match.score.fullTime.away}
                  </div>
                  {match.score.halfTime && (
                    <div className="match-score-half">
                      HT: {match.score.halfTime.home} - {match.score.halfTime.away}
                    </div>
                  )}
                </>
              ) : (
                <div className="match-score-main scheduled">vs</div>
              )}
            </div>

            {match.awayTeam?.id ? (
              <Link to={`/teams/${match.awayTeam.id}`} className="match-team clickable">
                <div className="match-team-crest">
                  {match.awayTeam.crest ? (
                    <img src={match.awayTeam.crest} alt={match.awayTeam.name} />
                  ) : (
                    <span>{match.awayTeam.tla || '???'}</span>
                  )}
                </div>
                <div className="match-team-name">{match.awayTeam.name || 'TBD'}</div>
                <div className="match-team-tla">{match.awayTeam.tla}</div>
              </Link>
            ) : (
              <div className="match-team">
                <div className="match-team-crest">
                  <span>???</span>
                </div>
                <div className="match-team-name">TBD</div>
                <div className="match-team-tla"></div>
              </div>
            )}
          </div>

          {match.venue && (
            <div className="match-venue">
              <span>&#128205;</span>
              <span>{match.venue}</span>
            </div>
          )}
        </div>

        {/* Match Info Grid */}
        <div className="match-info-grid">
          <div className="match-info-card">
            <div className="match-info-label">Competition</div>
            <div className="match-info-value">
              <Link to={`/competitions/${match.competition?.id}`}>
                {match.competition?.name}
              </Link>
            </div>
          </div>
          {match.season && (
            <div className="match-info-card">
              <div className="match-info-label">Season</div>
              <div className="match-info-value">
                {new Date(match.season.startDate).getFullYear()}/
                {new Date(match.season.endDate).getFullYear().toString().slice(-2)}
              </div>
            </div>
          )}
          {match.matchday && (
            <div className="match-info-card">
              <div className="match-info-label">Matchday</div>
              <div className="match-info-value">{match.matchday}</div>
            </div>
          )}
          <div className="match-info-card">
            <div className="match-info-label">Stage</div>
            <div className="match-info-value">{formatStage(match.stage)}</div>
          </div>
        </div>

        {/* Referees */}
        {match.referees && match.referees.length > 0 && (
          <div className="section">
            <div className="section-title">Match Officials</div>
            {match.referees.map((ref) => (
              <div key={ref.id} className="referee-item">
                <div className="referee-icon">&#128104;&#8205;&#9878;&#65039;</div>
                <div className="referee-info">
                  <div className="referee-name">{ref.name}</div>
                  <div className="referee-meta">
                    {ref.nationality || 'Unknown'} &bull; {ref.type || 'Referee'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Head to Head Section */}
        {h2h && h2h.matches && h2h.matches.length > 0 && (() => {
          // Compute stats from actual matches - more reliable than API aggregates
          const homeTeamId = match.homeTeam.id;

          let homeWins = 0, homeLosses = 0, draws = 0;
          let totalGoals = 0;

          h2h.matches.forEach((m) => {
            const homeScore = m.score?.fullTime?.home ?? 0;
            const awayScore = m.score?.fullTime?.away ?? 0;
            totalGoals += homeScore + awayScore;

            // Determine if current match's home team won/lost/drew
            const isHomeTeamHome = m.homeTeam.id === homeTeamId;
            const isHomeTeamAway = m.awayTeam.id === homeTeamId;

            if (homeScore === awayScore) {
              draws++;
            } else if (homeScore > awayScore) {
              // Home team of this historical match won
              if (isHomeTeamHome) homeWins++;
              else if (isHomeTeamAway) homeLosses++;
            } else {
              // Away team of this historical match won
              if (isHomeTeamAway) homeWins++;
              else if (isHomeTeamHome) homeLosses++;
            }
          });

          const awayWins = homeLosses;
          const awayLosses = homeWins;

          return (
            <div className="section">
              <div className="section-title">Head to Head</div>
              <div className="h2h-stats">
                <div className="h2h-team home">
                  <div className="h2h-team-header">
                    <div className="h2h-team-crest">
                      {match.homeTeam.crest && (
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} />
                      )}
                    </div>
                    <span className="h2h-team-name">{match.homeTeam.shortName || match.homeTeam.name}</span>
                  </div>
                  <div className="h2h-team-stats">
                    <div className="h2h-stat">
                      <div className="h2h-stat-value wins">{homeWins}</div>
                      <div className="h2h-stat-label">Wins</div>
                    </div>
                    <div className="h2h-stat">
                      <div className="h2h-stat-value draws">{draws}</div>
                      <div className="h2h-stat-label">Draws</div>
                    </div>
                    <div className="h2h-stat">
                      <div className="h2h-stat-value losses">{homeLosses}</div>
                      <div className="h2h-stat-label">Losses</div>
                    </div>
                  </div>
                </div>

                <div className="h2h-center">
                  <div className="h2h-total-matches">{h2h.matches.length}</div>
                  <div className="h2h-total-label">Last Matches</div>
                  <div className="h2h-total-goals">{totalGoals} goals scored</div>
                </div>

                <div className="h2h-team away">
                  <div className="h2h-team-header">
                    <div className="h2h-team-crest">
                      {match.awayTeam.crest && (
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} />
                      )}
                    </div>
                    <span className="h2h-team-name">{match.awayTeam.shortName || match.awayTeam.name}</span>
                  </div>
                  <div className="h2h-team-stats">
                    <div className="h2h-stat">
                      <div className="h2h-stat-value wins">{awayWins}</div>
                      <div className="h2h-stat-label">Wins</div>
                    </div>
                    <div className="h2h-stat">
                      <div className="h2h-stat-value draws">{draws}</div>
                      <div className="h2h-stat-label">Draws</div>
                    </div>
                    <div className="h2h-stat">
                      <div className="h2h-stat-value losses">{awayLosses}</div>
                      <div className="h2h-stat-label">Losses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Previous Matches */}
        {h2h && h2h.matches && h2h.matches.length > 0 && (
          <div className="section">
            <div className="section-title">Previous Meetings</div>
            {h2h.matches.slice(0, 10).map((prevMatch) => (
              <Link to={`/matches/${prevMatch.id}`} key={prevMatch.id} className="prev-match">
                <div className="prev-match-date">{formatDateShort(prevMatch.utcDate)}</div>
                <div className="prev-match-teams">
                  <div className={`prev-match-team ${prevMatch.score.winner === 'HOME_TEAM' ? 'winner' : ''}`}>
                    {prevMatch.homeTeam.crest && (
                      <img src={prevMatch.homeTeam.crest} alt={prevMatch.homeTeam.name} />
                    )}
                    <span>{prevMatch.homeTeam.shortName || prevMatch.homeTeam.name}</span>
                  </div>
                  <div className="prev-match-score">
                    {prevMatch.score.fullTime.home} : {prevMatch.score.fullTime.away}
                  </div>
                  <div className={`prev-match-team away ${prevMatch.score.winner === 'AWAY_TEAM' ? 'winner' : ''}`}>
                    <span>{prevMatch.awayTeam.shortName || prevMatch.awayTeam.name}</span>
                    {prevMatch.awayTeam.crest && (
                      <img src={prevMatch.awayTeam.crest} alt={prevMatch.awayTeam.name} />
                    )}
                  </div>
                </div>
                <div className="prev-match-comp">{prevMatch.competition?.code}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .match-page {
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

        .topbar-comp {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
        }

        .topbar-comp img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .topbar-comp-info {
          display: flex;
          flex-direction: column;
        }

        .topbar-comp-name {
          font-size: 14px;
          font-weight: 600;
        }

        .topbar-comp-meta {
          font-size: 11px;
          color: var(--text-muted);
        }

        .content {
          padding: 28px 32px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .match-hero {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 24px;
          text-align: center;
        }

        .match-status-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .match-status {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .match-status.live {
          background: var(--red-bg);
          color: var(--red-live);
        }

        .match-status.scheduled {
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan-light);
        }

        .match-status.finished {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }

        .match-status.halftime {
          background: rgba(250, 204, 21, 0.15);
          color: var(--yellow-draw);
        }

        .match-datetime {
          font-size: 13px;
          color: var(--text-muted);
        }

        .match-teams-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          margin-bottom: 24px;
        }

        .match-team {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          flex: 1;
          max-width: 200px;
          text-decoration: none;
          color: inherit;
        }

        .match-team.clickable {
          cursor: pointer;
        }

        .match-team.clickable:hover .match-team-crest {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
        }

        .match-team.clickable:hover .match-team-name {
          color: var(--cyan-light);
        }

        .match-team-crest {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .match-team-crest img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .match-team-crest span {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .match-team-name {
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          transition: color 0.2s ease;
        }

        .match-team-tla {
          font-size: 12px;
          color: var(--text-muted);
        }

        .match-score-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .match-score-main {
          font-size: 48px;
          font-weight: 700;
          letter-spacing: 8px;
        }

        .match-score-main.scheduled {
          font-size: 24px;
          color: var(--text-muted);
          letter-spacing: 0;
        }

        .match-score-half {
          font-size: 13px;
          color: var(--text-muted);
        }

        .match-venue {
          font-size: 13px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .match-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .match-info-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 16px;
        }

        .match-info-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .match-info-value {
          font-size: 14px;
          font-weight: 500;
        }

        .match-info-value a {
          color: var(--cyan-light);
          text-decoration: none;
        }

        .match-info-value a:hover {
          text-decoration: underline;
        }

        .section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(180deg, var(--cyan-primary), var(--cyan-secondary));
          border-radius: 2px;
        }

        .referee-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .referee-icon {
          width: 36px;
          height: 36px;
          background: var(--cyan-bg);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .referee-info {
          flex: 1;
        }

        .referee-name {
          font-size: 14px;
          font-weight: 500;
        }

        .referee-meta {
          font-size: 12px;
          color: var(--text-muted);
        }

        .h2h-stats {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          align-items: center;
        }

        .h2h-team {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .h2h-team.home {
          align-items: flex-start;
        }

        .h2h-team.away {
          align-items: flex-end;
        }

        .h2h-team-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .h2h-team.away .h2h-team-header {
          flex-direction: row-reverse;
        }

        .h2h-team-crest {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          padding: 4px;
        }

        .h2h-team-crest img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .h2h-team-name {
          font-size: 14px;
          font-weight: 600;
        }

        .h2h-team-stats {
          display: flex;
          gap: 16px;
        }

        .h2h-team.away .h2h-team-stats {
          flex-direction: row-reverse;
        }

        .h2h-stat {
          text-align: center;
        }

        .h2h-stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .h2h-stat-value.wins {
          color: var(--green-win);
        }

        .h2h-stat-value.draws {
          color: var(--yellow-draw);
        }

        .h2h-stat-value.losses {
          color: #f87171;
        }

        .h2h-stat-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .h2h-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .h2h-total-matches {
          font-size: 28px;
          font-weight: 700;
          color: var(--cyan-light);
        }

        .h2h-total-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .h2h-total-goals {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .prev-match {
          display: flex;
          align-items: center;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 8px;
          background: rgba(6, 182, 212, 0.02);
          border: 1px solid rgba(6, 182, 212, 0.08);
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }

        .prev-match:hover {
          background: rgba(6, 182, 212, 0.05);
        }

        .prev-match-date {
          width: 100px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .prev-match-teams {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .prev-match-team {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          font-size: 13px;
        }

        .prev-match-team.away {
          flex-direction: row-reverse;
          text-align: right;
        }

        .prev-match-team img {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }

        .prev-match-team.winner {
          font-weight: 600;
        }

        .prev-match-score {
          font-size: 14px;
          font-weight: 700;
          min-width: 50px;
          text-align: center;
        }

        .prev-match-comp {
          width: 70px;
          text-align: right;
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

          .match-hero {
            padding: 24px 16px;
          }

          .match-teams-display {
            flex-direction: column;
            gap: 24px;
          }

          .match-score-display {
            order: -1;
          }

          .h2h-stats {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .h2h-team,
          .h2h-team.home,
          .h2h-team.away {
            align-items: center;
          }

          .h2h-team-header,
          .h2h-team.away .h2h-team-header {
            flex-direction: row;
          }

          .h2h-team-stats,
          .h2h-team.away .h2h-team-stats {
            flex-direction: row;
          }

          .prev-match {
            flex-wrap: wrap;
          }

          .prev-match-date {
            width: 100%;
            margin-bottom: 8px;
          }

          .prev-match-comp {
            width: 100%;
            text-align: left;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default MatchPage;
