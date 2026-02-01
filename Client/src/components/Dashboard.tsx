import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FavouritesContext } from '../context/FavouritesContext';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const { logout } = useContext(AuthContext);
  const { favTeams, favComps, loading } = useContext(FavouritesContext);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner message="Loading your favorites..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logout Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-medium"
          >
            Logout
          </button>
        </div>

        {/* Favorite Teams */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Favorite Teams
          </h2>
          {favTeams.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              You have no favourite teams
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favTeams.map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="flex flex-col items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-md hover:shadow-lg group"
                >
                  <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img
                      src={team.crest}
                      alt={team.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <span className="text-slate-200 font-medium text-sm text-center line-clamp-2">
                    {team.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Competitions */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Favorite Competitions
          </h2>
          {favComps.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              You have no favourite competitions
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favComps.map((comp) => (
                <Link
                  key={comp.id}
                  to={`/competitions/${comp.id}`}
                  className="flex flex-col items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-md hover:shadow-lg group"
                >
                  <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img
                      src={comp.emblem}
                      alt={comp.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <span className="text-slate-200 font-medium text-sm text-center line-clamp-2">
                    {comp.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
