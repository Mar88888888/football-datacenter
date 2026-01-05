import React from 'react';
import { Link } from 'react-router-dom';

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
    <ul className="list-none p-0 my-5 w-full max-w-2xl mx-auto space-y-3">
      {matches.map((match) => (
        <li
          key={match.id}
          className="flex items-center justify-between bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-700 transition-all duration-200 border border-slate-700"
        >
          <div className="flex flex-col items-center w-[30%] text-center">
            <Link to={`/teams/${match.homeTeam.id}`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <img
                src={match.homeTeam.crest}
                alt="Home Team Logo"
                className="w-14 h-14 object-contain select-none"
              />
              <div className="text-sm mt-2 text-slate-200 font-medium">{match.homeTeam.shortName}</div>
            </Link>
          </div>

          <div className="text-center w-[40%] space-y-1">
            <span className="block text-xs text-slate-400">{match?.tournament?.name}</span>
            <span className="block text-xs text-slate-500">
              Matchday {match?.roundInfo?.round}
            </span>
            <span className="block text-sm text-slate-300">
              {formatTime(new Date(match?.utcDate))}
            </span>
            <span className="block text-xs text-slate-500">
              {formatDateOnly(new Date(match?.utcDate))}
            </span>
            {match.status.type === 'notstarted' ? (
              <span className="block text-2xl font-bold text-slate-200">vs</span>
            ) : (
              <span className="block text-2xl font-bold text-green-400">
                {match?.homeScore?.current} - {match?.awayScore?.current}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center w-[30%] text-center">
            <Link to={`/teams/${match?.awayTeam?.id}`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <img
                src={match.awayTeam.crest}
                alt="Away Team Logo"
                className="w-14 h-14 object-contain select-none"
              />
              <div className="text-sm mt-2 text-slate-200 font-medium">{match?.awayTeam?.shortName}</div>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MatchList;
