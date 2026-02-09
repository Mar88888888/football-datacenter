import React from 'react';
import { Link } from 'react-router-dom';
import type { Match } from '../types';

interface MatchCardProps {
  match: Match;
  showCompetition?: boolean;
}

const LIVE_STATUSES = ['IN_PLAY', 'PAUSED', 'HALF_TIME'];

const MatchCard: React.FC<MatchCardProps> = ({ match, showCompetition = false }) => {
  const isLive = LIVE_STATUSES.includes(match.status);
  const isFinished = match.status === 'FINISHED';
  const isScheduled = match.status === 'SCHEDULED' || match.status === 'TIMED';

  const formatTime = (utcDate: string): string => {
    const date = new Date(utcDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const homeScore = match.score?.fullTime?.home ?? 0;
  const awayScore = match.score?.fullTime?.away ?? 0;
  const homeWinning = homeScore > awayScore;
  const awayWinning = awayScore > homeScore;

  return (
    <Link
      to={`/matches/${match.id}`}
      className={`match-card glass-card ${isLive ? 'live' : ''}`}
    >
      {isLive && (
        <div className="live-corner-badge">
          <span className="live-dot" />
          <span className="live-text">LIVE</span>
        </div>
      )}
      <div className={`time ${isLive ? 'live-time' : ''}`}>
        {isFinished ? 'FT' : formatTime(match.utcDate)}
      </div>

      <div className="teams-section">
        <div className="team-row">
          <div className="team-crest">
            {match.homeTeam?.crest ? (
              <img src={match.homeTeam.crest} alt={match.homeTeam.name || ''} />
            ) : (
              <span>{match.homeTeam?.tla || '???'}</span>
            )}
          </div>
          <span className="team-name">
            {match.homeTeam?.shortName || match.homeTeam?.name || 'TBD'}
          </span>
          <span className={`team-score ${!isScheduled && homeWinning ? 'winner' : ''}`}>
            {isScheduled ? '-' : homeScore}
          </span>
        </div>

        <div className="team-row">
          <div className="team-crest">
            {match.awayTeam?.crest ? (
              <img src={match.awayTeam.crest} alt={match.awayTeam.name || ''} />
            ) : (
              <span>{match.awayTeam?.tla || '???'}</span>
            )}
          </div>
          <span className="team-name">
            {match.awayTeam?.shortName || match.awayTeam?.name || 'TBD'}
          </span>
          <span className={`team-score ${!isScheduled && awayWinning ? 'winner' : ''}`}>
            {isScheduled ? '-' : awayScore}
          </span>
        </div>
      </div>

      {showCompetition && match.competition && (
        <div className="comp-section">
          {match.competition.emblem && (
            <div className="comp-emblem">
              <img src={match.competition.emblem} alt={match.competition.name} />
            </div>
          )}
          <span className="comp-name">{match.competition.name}</span>
        </div>
      )}

      <style>{`
        .match-card {
          position: relative;
          display: flex;
          align-items: stretch;
          padding: 12px 16px;
          gap: 14px;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }

        .match-card:hover {
          background: rgba(6, 182, 212, 0.05);
          border-color: rgba(6, 182, 212, 0.15);
        }

        .match-card.live {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.05);
        }

        .time {
          width: 42px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          align-self: center;
          font-size: 13px;
          color: #d1d5db;
          font-weight: 600;
        }

        .time.live-time {
          font-size: 11px;
          color: #6b7280;
        }

        .live-corner-badge {
          position: absolute;
          top: 4px;
          left: 6px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .live-dot {
          width: 5px;
          height: 5px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .live-text {
          font-size: 9px;
          color: #22c55e;
          font-weight: 600;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .teams-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
        }

        .team-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .team-crest {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 5px;
          padding: 3px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .team-crest img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .team-crest span {
          font-size: 8px;
          font-weight: 600;
          color: #333;
        }

        .team-name {
          font-size: 14px;
          font-weight: 500;
          flex: 1;
        }

        .team-score {
          font-size: 17px;
          font-weight: 700;
          width: 28px;
          flex-shrink: 0;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .team-score.winner {
          color: #22c55e;
        }

        .comp-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 60px;
          flex-shrink: 0;
          padding-left: 14px;
          border-left: 1px solid rgba(75, 85, 99, 0.3);
        }

        .comp-emblem {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 5px;
          padding: 3px;
        }

        .comp-emblem img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .comp-name {
          font-size: 8px;
          color: #6b7280;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          line-height: 1.2;
          max-width: 55px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Link>
  );
};

export default MatchCard;
