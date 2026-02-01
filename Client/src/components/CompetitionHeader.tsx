import React from 'react';
import FavouriteButton from './FavouriteButton';
import type { Competition, Season } from '../types';

const formatSeasonRange = (currentSeason: Season | undefined): string | null => {
  if (!currentSeason) return null;
  const start = new Date(currentSeason.startDate);
  const end = new Date(currentSeason.endDate);
  return `${start.getFullYear()}/${end.getFullYear().toString().slice(-2)}`;
};

interface CompetitionHeaderProps {
  competition: Competition;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  loading: boolean;
}

const CompetitionHeader: React.FC<CompetitionHeaderProps> = ({ competition, isFavourite, onToggleFavourite, loading }) => {
  const seasonRange = formatSeasonRange(competition.currentSeason);

  return (
    <div className="bg-gradient-to-b from-slate-950 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Top Section - Emblem and Name */}
          <div className="bg-slate-900/50 px-8 py-6 border-b border-slate-700/50">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg flex-shrink-0">
                <img
                  src={competition.emblem}
                  alt={competition.name}
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-white truncate">{competition.name}</h1>
                {competition.area && (
                  <div className="flex items-center gap-2 mt-2">
                    {competition.area.flag && (
                      <img
                        src={competition.area.flag}
                        alt={competition.area.name}
                        className="w-5 h-4 object-cover rounded-sm"
                      />
                    )}
                    <span className="text-slate-400">{competition.area.name}</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <FavouriteButton
                  isFavourite={isFavourite}
                  onClick={onToggleFavourite}
                  loading={loading}
                />
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-slate-700/50">
            {seasonRange && (
              <div className="p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Season</p>
                <p className="text-lg font-semibold text-white">{seasonRange}</p>
              </div>
            )}
            {competition.currentSeason?.currentMatchday && (
              <div className="p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Matchday</p>
                <p className="text-lg font-semibold text-white">
                  {competition.currentSeason.currentMatchday}
                </p>
              </div>
            )}
            {competition.type && (
              <div className="p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Type</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {competition.type.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionHeader;
