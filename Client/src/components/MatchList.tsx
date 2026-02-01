import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Match, TeamMinimal } from '../types';

interface TeamCardProps {
  team: TeamMinimal;
  isNationalTeam: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isNationalTeam }) => {
  const content = (
    <>
      <div className="w-16 h-16 bg-white rounded-lg p-1 flex items-center justify-center">
        <img
          src={team?.crest}
          alt={team?.shortName || team?.name || 'Team'}
          className="w-14 h-14 object-contain select-none"
        />
      </div>
      <div className="text-sm mt-2 text-slate-200 font-medium">
        {team?.shortName || team?.name || 'TBD'}
      </div>
    </>
  );

  if (isNationalTeam || !team?.id) {
    return <div className="flex flex-col items-center">{content}</div>;
  }

  return (
    <Link
      to={`/teams/${team.id}`}
      className="flex flex-col items-center hover:opacity-80 transition-opacity"
    >
      {content}
    </Link>
  );
};

interface MatchListProps {
  matches: Match[];
  pageSize?: number;
  isNationalTeam?: boolean;
}

const MatchList: React.FC<MatchListProps> = ({ matches, pageSize = 10, isNationalTeam = false }) => {
  // Calculate the smart default page based on current date
  const getDefaultPage = useMemo(() => {
    if (!matches || matches.length === 0) return 1;

    const now = new Date();
    const totalPages = Math.ceil(matches.length / pageSize);

    // Find the index of the first future match (or closest to now)
    let targetIndex = matches.findIndex((match) => {
      const matchDate = new Date(match.utcDate);
      return matchDate >= now;
    });

    // If all matches are in the past, go to last page
    if (targetIndex === -1) {
      return totalPages;
    }

    // If all matches are in the future, stay on first page
    if (targetIndex === 0) {
      return 1;
    }

    // Calculate which page contains this match
    return Math.floor(targetIndex / pageSize) + 1;
  }, [matches, pageSize]);

  const [currentPage, setCurrentPage] = useState(getDefaultPage);

  // Reset to smart default page when matches change
  useEffect(() => {
    setCurrentPage(getDefaultPage);
  }, [getDefaultPage]);

  const totalPages = Math.ceil(matches.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMatches = matches.slice(startIndex, startIndex + pageSize);

  const formatTime = (utcDate: string): string => {
    if (!utcDate) return 'Not Set';
    const date = new Date(utcDate);
    return `${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatDateOnly = (utcDate: string): string => {
    const date = new Date(utcDate);
    return date.toLocaleDateString();
  };

  const goToPage = (page: number): void => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <ul className="list-none p-0 my-5 w-full max-w-2xl mx-auto space-y-3">
        {paginatedMatches.map((match) => (
        <li
          key={match.id}
          className="flex items-center justify-between bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-700 transition-all duration-200 border border-slate-700"
        >
          <div className="flex flex-col items-center w-[30%] text-center">
            <TeamCard team={match.homeTeam} isNationalTeam={isNationalTeam} />
          </div>

          <div className="text-center w-[40%] space-y-1">
            <span className="block text-xs text-slate-400">{match?.competition?.name}</span>
            {match?.matchday && (
              <span className="block text-xs text-slate-500">
                Matchday {match.matchday}
              </span>
            )}
            <span className="block text-sm text-slate-300">
              {formatTime(match?.utcDate)}
            </span>
            <span className="block text-xs text-slate-500">
              {formatDateOnly(match?.utcDate)}
            </span>
            {match.status === 'SCHEDULED' || match.status === 'TIMED' ? (
              <span className="block text-2xl font-bold text-slate-200">vs</span>
            ) : match.status === 'IN_PLAY' || match.status === 'PAUSED' ? (
              <span className="block text-2xl font-bold text-yellow-400">
                {match.score?.fullTime?.home ?? 0} - {match.score?.fullTime?.away ?? 0}
              </span>
            ) : (
              <span className="block text-2xl font-bold text-green-400">
                {match.score?.fullTime?.home ?? '-'} - {match.score?.fullTime?.away ?? '-'}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center w-[30%] text-center">
            <TeamCard team={match.awayTeam} isNationalTeam={isNationalTeam} />
          </div>
        </li>
      ))}
    </ul>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &laquo;
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &lsaquo;
          </button>

          <button
            onClick={() => goToPage(getDefaultPage)}
            disabled={currentPage === getDefaultPage}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg border border-blue-500 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Today
          </button>

          <span className="px-4 py-2 text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &rsaquo;
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchList;
