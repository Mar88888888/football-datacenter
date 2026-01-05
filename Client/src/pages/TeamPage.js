import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MatchList from '../components/MatchList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';

const TeamPage = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    // Reset state when navigating to a different team
    setLoading(true);
    setTeam(null);
    setMatches([]);
    setError(null);

    const fetchTeamData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/teams/${id}`
        );
        if (response.status === 404) {
          setError('Team not found.');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setTeam(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch team data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/teams/${id}/matches`)
        .then((res) => res.json())
        .then((data) => setMatches(data))
        .catch((err) => {
          setError(true);
          console.error(err);
        });
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      setIsFavourite(false);
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/user/favteam`, {
        withCredentials: true,
      })
      .then((response) => {
        const isFav = response.data.some((favTeam) => favTeam.id === +id);
        setIsFavourite(isFav);
      })
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  }, [id, user]);

  const handleAddToFavourite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/favteam/${team.id}`,
        {},
        { withCredentials: true }
      );
      setIsFavourite(true);

      if (response.status === 201) {
        alert(`${team.name} has been added to your favourites!`);
      } else {
        console.log(response.status);
        alert('Failed to add to favourites.');
      }
    } catch (error) {
      setError(true);
      console.error('Error adding to favourites:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handleRemoveFromFavourite = () => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/user/favteam/${team.id}`, {
        withCredentials: true,
      })
      .then((_) => {
        setIsFavourite(false);
        alert(`${team.name} has been removed from your favourites!`);
      })
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  };

  if (loading) {
    return <LoadingSpinner message="Loading team data..." />;
  }

  if (error || !team) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Team Header/Passport */}
      <div className="bg-slate-950 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Team Info */}
            <div className="flex gap-4 flex-1">
              <div className="flex-shrink-0">
                <div className="w-28 h-28 bg-white rounded-lg p-2 flex items-center justify-center">
                  <img src={team.crest} alt="Team Logo" className="w-24 h-24 object-contain" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                {team.founded !== 'NaN/NaN/NaN' && (
                  <p className="text-slate-400">
                    <span className="text-slate-500">Founded:</span> {team.founded}
                  </p>
                )}
                <p className="text-slate-400 flex items-center gap-2">
                  <span className="text-slate-500">Colors:</span>
                  <span
                    className="inline-block w-12 h-4 rounded border border-slate-600"
                    style={{ backgroundColor: team.clubColors }}
                  ></span>
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">City:</span> {team.address}
                </p>
              </div>
            </div>

            {/* Coach Info */}
            <div className="text-center md:text-right md:self-center">
              <h3 className="text-sm uppercase text-slate-500 tracking-wider mb-1">Coach</h3>
              <p className="text-lg text-white font-medium">{team.coachName}</p>
            </div>
          </div>

          {/* Favourite Button */}
          <div className="mt-6 text-center">
            {isFavourite ? (
              <button
                onClick={handleRemoveFromFavourite}
                className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-medium"
              >
                Remove from favourites
              </button>
            ) : (
              <button
                onClick={handleAddToFavourite}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium"
              >
                Add to favourites
              </button>
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
