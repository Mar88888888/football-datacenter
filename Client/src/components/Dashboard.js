import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/global.css'; // Import the global stylesheet

const Dashboard = () => {
  const [favTeams, setFavTeams] = useState([]);
  const [favComps, setFavComps] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const [teamsResponse, compsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/user/favteam`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_API_URL}/user/favcomp`, { withCredentials: true }),
        ]);
        setFavTeams(teamsResponse.data);
        setFavComps(compsResponse.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Dashboard</h1>
      
      <div className="section">
        <h2 className="section-title">Favorite Teams</h2>
        <ul className="list">
          {favTeams.map((team) => (
            <li key={team.id} className="list-item">{team.name}</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Favorite Competitions</h2>
        <ul className="list">
          {favComps.map((comp) => (
            <li key={comp.id} className="list-item">{comp.name}</li>
          ))}
        </ul>
      </div>
    </div>

  );
};

export default Dashboard;
