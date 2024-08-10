import React, { useEffect, useState } from 'react';
import { fetchPlayers, fetchTeams, fetchCompetitions } from '../services/apiService';
import './PlayersPage.css'

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
        const data = await fetchPlayers(selectedTeam);
        setPlayers(data);
      } catch (error) {
        setError('Failed to fetch players');
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [selectedTeam]);

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="players-container">
      <h1 className="players-title">Players</h1>
      <select className="players-select" onChange={(e) => setSelectedCompetition(e.target.value)} value={selectedCompetition}>
        {competitions.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
          </option>
        ))}
      </select>
      <select className="players-select" onChange={(e) => setSelectedTeam(e.target.value)} value={selectedTeam}>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <ul className="players-list">
        {players.map((player) => (
          <li key={player.id} className="players-item">
            {player.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersPage;
