import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import MatchList from '../components/MatchList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Match, Competition } from '../types';

const HomePage: React.FC = () => {
  // Fetch matches and competitions with automatic 202 retry
  const {
    data: matchesData,
    loading: loadingMatches,
    error: matchesError,
  } = useApi<Match[]>(API_ENDPOINTS.MATCHES);

  const {
    data: competitionsData,
    loading: loadingComps,
    error: compsError,
  } = useApi<Competition[]>(API_ENDPOINTS.COMPETITIONS);

  // Ensure arrays are always defined
  const matches = matchesData || [];
  const competitions = competitionsData || [];

  const loading = loadingMatches || loadingComps;
  const error = matchesError || compsError;

  if (loading) {
    return <LoadingSpinner message="Loading today's matches..." />;
  }

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="flex flex-col lg:flex-row">
        {/* Competitions Sidebar - fixed to left */}
        <div className="lg:w-64 flex-shrink-0 lg:pl-4 mb-8 lg:mb-0">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 sticky top-8">
            <h3 className="text-lg font-bold text-white mb-4">Competitions</h3>
            <ul className="space-y-2">
              {competitions.map((comp) => (
                <li key={comp.id}>
                  <Link
                    to={`/competitions/${comp.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    {comp.emblem && (
                      <div className="w-7 h-7 bg-white rounded p-0.5 flex items-center justify-center flex-shrink-0">
                        <img
                          src={comp.emblem}
                          alt={comp.name}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                    <span className="text-slate-200 text-sm font-medium truncate">
                      {comp.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content - centered */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-2xl">
            <h3 className="text-4xl font-bold text-center text-white mb-8">
              Today's Matches
            </h3>
            {matches.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                No matches scheduled for today
              </p>
            ) : (
              <MatchList matches={matches} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
