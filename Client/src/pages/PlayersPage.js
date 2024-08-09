import React, { useEffect, useState } from 'react';
import { fetchPlayers, fetchTeams, fetchCompetitions } from '../services/apiService';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Players</h1>
      <select onChange={(e) => setSelectedCompetition(e.target.value)} value={selectedCompetition}>
        {competitions.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
          </option>
        ))}
      </select>
      <select onChange={(e) => setSelectedTeam(e.target.value)} value={selectedTeam}>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersPage;
