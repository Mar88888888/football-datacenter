import React, { useEffect, useState } from 'react';
import { fetchPlayers, fetchTeams, fetchCompetitions } from '../services/apiService';
import '../styles/PlayersPage.css'

const PlayersPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const data = await fetchCompetitions();
        setCompetitions(data);
        if (data.length > 0) setSelectedCompetition(data[0].id);
      } catch (error) {
        setError('Failed to fetch competitions');
      }
    };

    loadCompetitions();
  }, []);

  useEffect(() => {
    if (!selectedCompetition) return;

    const loadTeams = async () => {
      try {
        const data = await fetchTeams(selectedCompetition);
        setTeams(data);
        if (data.length > 0) setSelectedTeam(data[0].id);
      } catch (error) {
        setError('Failed to fetch teams');
      }
    };

    loadTeams();
  }, [selectedCompetition]);

  useEffect(() => {
    if (!selectedTeam) return;

    const loadPlayers = async () => {
      try {
        let data = await fetchPlayers(selectedTeam);
        data = data.map(obj => obj?.player);
        setPlayers(sortByName(data));
      } catch (error) {
        setError('Failed to fetch players');
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [selectedTeam]);

  function sortByName(arr){
    return arr.sort((obj1, obj2) => {
        if(!obj1.name || !obj2.name){
          console.log('noName')
          return;
        }
        if (obj1.name < obj2.name) {
          return -1;
        } else if (obj1.name > obj2.name) {
          return 1;
        }
        return 0;
      }
      );
  }

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="container">
      <h1 className="title">Players</h1>
      <select className="select-item" onChange={(e) => setSelectedCompetition(e.target.value)} value={selectedCompetition}>
        {sortByName(competitions).map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
          </option>
        ))}
      </select>
      <select className="select-item" onChange={(e) => setSelectedTeam(e.target.value)} value={selectedTeam}>
        {sortByName(teams).map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <ul className="list">
        {players.map((player) => (
          <li key={player.id} className="list-item">
            {player.name}
          </li>
        ))}
      </ul>
    </div>

  );
};

export default PlayersPage;