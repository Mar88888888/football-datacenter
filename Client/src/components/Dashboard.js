import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ErrorPage from '../pages/ErrorPage';

const Dashboard = () => {
  const [favTeams, setFavTeams] = useState([]);
  const [favComps, setFavComps] = useState([]);
  const { setUser } = useContext(AuthContext);
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const [teamsResponse, compsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/user/favteam`, {
            withCredentials: true,
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/user/favcomp`, {
            withCredentials: true,
          }),
        ]);
        setFavTeams(teamsResponse.data);
        setFavComps(compsResponse.data);
      } catch (error) {
        setError(true);
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/user/auth/signout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate('/login');
    } catch (error) {
      setError(true);
      console.error('Error during logout:', error);
    }
  };

  if (error) {
    return <ErrorPage />;
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
          <ul className="list-none p-0 flex flex-col gap-3 max-w-xl mx-auto">
            {favTeams.length === 0 ? (
              <li className="text-slate-400 text-center py-8">
                You have no favourite teams
              </li>
            ) : (
              favTeams.map((team) => (
                <li key={team.id}>
                  <Link
                    to={`/teams/${team.id}`}
                    className="block bg-slate-800 border border-slate-700 rounded-lg p-4 text-center text-slate-200 font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {team.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Favorite Competitions */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Favorite Competitions
          </h2>
          <ul className="list-none p-0 flex flex-col gap-3 max-w-xl mx-auto">
            {favComps.length === 0 ? (
              <li className="text-slate-400 text-center py-8">
                You have no favourite competitions
              </li>
            ) : (
              favComps.map((comp) => (
                <li key={comp.id}>
                  <Link
                    to={`/competitions/${comp.id}`}
                    className="block bg-slate-800 border border-slate-700 rounded-lg p-4 text-center text-slate-200 font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {comp.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
