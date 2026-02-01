import React from 'react';
import { Link } from 'react-router-dom';

interface League {
  id: number;
  name: string;
  crest?: string;
  emblem?: string;
}

interface TopLeaguesProps {
  leagues: League[];
}

const TopLeagues: React.FC<TopLeaguesProps> = ({ leagues }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">Top Leagues</h3>
      <ul className="space-y-2">
        {leagues.map((league) => (
          <li key={league.id}>
            <Link
              to={`/competitions/${league.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <img
                src={league.crest ? league.crest : league.emblem}
                alt={league.name}
                className="w-6 h-6 object-contain"
              />
              <span className="text-slate-200 text-sm font-medium">
                {league.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopLeagues;
