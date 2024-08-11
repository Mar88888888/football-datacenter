import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div>
      <h1>Dashboard</h1>
      <h2>Favorite Teams</h2>
      <ul>
        {favTeams.map(team => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
      <h2>Favorite Competitions</h2>
      <ul>
        {favComps.map(comp => (
          <li key={comp.id}>{comp.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
