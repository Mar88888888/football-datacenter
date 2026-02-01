import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';

interface Country {
  name: string;
  alpha2: string;
}

interface PlayerTeam {
  id: number;
  name: string;
}

interface Player {
  name: string;
  height: number;
  preferredFoot: string;
  dateOfBirthTimestamp: number;
  proposedMarketValue: number;
  position: string;
  country: Country;
  shirtNumber: number;
  photo: string;
  team: PlayerTeam;
  contractUntilTimestamp: number;
}

const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch player data with automatic 202 retry
  const { data: player, loading, error } = useApi<Player>(`/players/${id}`);

  const calculateAge = (birthTimestamp: number): number => {
    const birthDate = new Date(birthTimestamp * 1000);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return <LoadingSpinner message="Loading player data..." />;
  }

  if (error || !player) {
    return <ErrorPage />;
  }

  const dateOfBirth = new Date(
    player.dateOfBirthTimestamp * 1000
  ).toLocaleDateString();

  const playerAge = calculateAge(player.dateOfBirthTimestamp);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Player Header */}
      <div className="bg-slate-950 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Player Photo & Basic Info */}
            <div className="flex gap-4 flex-1">
              <div className="flex-shrink-0">
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                <p className="text-slate-400">
                  <span className="text-slate-500">Height:</span> {player.height} cm
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Preferred Foot:</span> {player.preferredFoot}
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Born:</span> {dateOfBirth}{' '}
                  <span className="text-blue-400">({playerAge} years)</span>
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Market Value:</span>{' '}
                  <span className="text-green-400 font-semibold">
                    &euro;{player.proposedMarketValue.toLocaleString()}
                  </span>
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Position:</span> {player.position}
                </p>
              </div>
            </div>

            {/* Country & Shirt Number */}
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Country */}
              <div className="text-center">
                <h3 className="text-sm uppercase text-slate-500 tracking-wider mb-2">Country</h3>
                <p className="text-white font-medium mb-2">{player.country.name}</p>
                <img
                  src={`https://flagcdn.com/w80/${player.country.alpha2.toLowerCase()}.png`}
                  alt={`${player.country.name} flag`}
                  className="w-12 h-auto mx-auto rounded shadow"
                />
              </div>

              {/* Shirt Number */}
              <div className="relative mt-4">
                <div className="w-20 h-24 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-3xl relative flex items-center justify-center shadow-lg">
                  <div className="absolute top-0 left-0 w-6 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-br-xl -translate-x-1"></div>
                  <div className="absolute top-0 right-0 w-6 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-bl-xl translate-x-1"></div>
                  <span className="text-3xl font-bold text-white drop-shadow-lg">
                    {player.shirtNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-white mb-6">Team</h3>
          <Link to={`/teams/${player.team.id}`}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex items-center gap-6 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-md hover:shadow-lg">
              <img
                src={`https://api.sofascore.app/api/v1/team/${player.team.id}/image`}
                alt={player.team.name}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{player.team.name}</h3>
                <p className="text-slate-400">
                  <span className="text-slate-500">Contract Until:</span>{' '}
                  {new Date(player.contractUntilTimestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
