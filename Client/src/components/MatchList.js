import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MatchList.css';

const MatchList = ({ matches }) => {
  const formatTime = (utcDate) => {
    if (!utcDate) return 'Not Set';
    const date = new Date(utcDate);
    return `${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatDateOnly = (utcDate) => {
    const date = new Date(utcDate);
    return date.toLocaleDateString();
  };

  return (
    <ul className="matches-list">
      {matches.map((match) => (
        <li className="match-item list-item" key={match.id}>
          <div className="team-match">
            <Link to={`/teams/${match.homeTeam.id}`}>
              <img
                src={match.homeTeam.crest}
                alt="Home Team Logo"
                className="team-crest"
              />
              <div className="team-name">{match.homeTeam.shortName}</div>
            </Link>
          </div>
          <div className="match-time-date">
            <span className="match-competition">{match?.tournament?.name}</span>
            <span className="match-date">
              Matchday {match?.roundInfo?.round}
            </span>
            <span className="match-time">
              {formatTime(new Date(match?.utcDate))}
            </span>
            <span className="match-date">
              {formatDateOnly(new Date(match?.utcDate))}
            </span>
            {match.status.type === 'notstarted' ? (
              <span className="match-score">vs</span>
            ) : (
              <span className="match-score">
                {match?.homeScore?.current} - {match?.awayScore?.current}
              </span>
            )}
          </div>
          <div className="team-match">
            <Link to={`/teams/${match?.awayTeam?.id}`}>
              <img
                src={match.awayTeam.crest}
                alt="Away Team Logo"
                className="team-crest"
              />
              <div className="team-name">{match?.awayTeam?.shortName}</div>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MatchList;
