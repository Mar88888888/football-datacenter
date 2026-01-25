import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import useFavourite from '../hooks/useFavourite';
import FavouriteButton from '../components/FavouriteButton';
import MatchList from '../components/MatchList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS, TEAM_COLORS } from '../constants';

const parseClubColors = (colorString) => {
  if (!colorString) return [];
  return colorString
    .toLowerCase()
    .split('/')
    .map((c) => c.trim())
    .map((colorName) => TEAM_COLORS[colorName] || null)
    .filter(Boolean);
};

const TeamPage = () => {
  const { id } = useParams();

  // Fetch team data
  const { data: team, loading, error: teamError } = useApi(API_ENDPOINTS.TEAM(id));

  // Fetch team matches
  const { data: matchesData } = useApi(API_ENDPOINTS.TEAM_MATCHES(id));
  const matches = matchesData || [];

  // Favourite management
  const { isFavourite, loading: favouriteLoading, toggleFavourite } = useFavourite(
    'team',
    id,
    team?.name
  );

  if (loading) {
    return <LoadingSpinner message="Loading team data..." />;
  }

  if (teamError || !team) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Team Header */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            {/* Top Section - Crest and Name */}
            <div className="bg-slate-900/50 px-8 py-6 border-b border-slate-700/50">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg flex-shrink-0">
                  <img src={team.crest} alt={team.name} className="w-20 h-20 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white truncate">{team.name}</h1>
                  {team.tla && (
                    <span className="inline-block mt-2 px-3 py-1 bg-slate-700 text-slate-300 text-sm font-medium rounded-full">
                      {team.tla}
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <FavouriteButton
                    isFavourite={isFavourite}
                    onClick={toggleFavourite}
                    loading={favouriteLoading}
                  />
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-700/50">
              {team.founded && (
                <div className="p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Founded</p>
                  <p className="text-lg font-semibold text-white">{team.founded}</p>
                </div>
              )}
              {team.coach?.name && (
                <div className="p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Manager</p>
                  <p className="text-lg font-semibold text-white">{team.coach.name}</p>
                </div>
              )}
              {team.venue && (
                <div className="p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Stadium</p>
                  <p className="text-lg font-semibold text-white truncate" title={team.venue}>
                    {team.venue}
                  </p>
                </div>
              )}
              {team.clubColors && (
                <div className="p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Colors</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {parseClubColors(team.clubColors).map((color, idx) => (
                      <span
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-slate-600 shadow-inner"
                        style={{ backgroundColor: color }}
                        title={team.clubColors}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Address Bar */}
            {team.address && (
              <div className="px-8 py-4 bg-slate-900/30 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 text-center">
                  <span className="text-slate-500">Location:</span> {team.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Competitions */}
          <h3 className="text-3xl font-bold text-center text-white mb-6">Competitions</h3>
          <ul className="list-none p-0 mb-12 flex flex-col gap-3 max-w-xl mx-auto">
            {team.runningCompetitions.map((comp) => (
              <li key={comp.id}>
                <Link
                  to={`/competitions/${comp.id}`}
                  className="block bg-slate-800 border border-slate-700 rounded-lg p-4 text-center text-slate-200 font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {comp.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Scheduled Matches */}
          <h3 className="text-3xl font-bold text-center text-white mb-6">Scheduled Matches</h3>
          <MatchList matches={matches} />
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
