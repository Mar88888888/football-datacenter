import React, { useEffect, useState, useContext  } from 'react';
import axios from 'axios';
import '../styles/global.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css'

const Dashboard = () => {
  const [favTeams, setFavTeams] = useState([]);
  const [favComps, setFavComps] = useState([]);
  const { setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const [teamsResponse, compsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/user/favteam`, { 
            withCredentials: true 
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/user/favcomp`, { 
            withCredentials: true,
          }),
        ]);
        setFavTeams(teamsResponse.data);
        setFavComps(compsResponse.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

 const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/user/auth/signout`, {}, { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="container">
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="section">
        <h2 className="section-title">Favorite Teams</h2>
        <ul className="list">
          {(favTeams.length === 0) ? <li>You have no favourite teams</li>: ''}
          {favTeams.map((team) => (
            <li key={team.id} className="list-item">              
              <Link to={`/teams/${team.id}`}>{team.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Favorite Competitions</h2>
        <ul className="list">
          {(favComps.length === 0) ? <li>You have no favourite competitions</li>: ''}
          {favComps.map((comp) => (
            <li key={comp.id} className="list-item">
              <Link to={`/competitions/${comp.id}`}>{comp.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

  );
};

export default Dashboard;
