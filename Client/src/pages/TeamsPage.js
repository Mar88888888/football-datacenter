import React, { useEffect, useState } from 'react';
import { fetchTeams, fetchCompetitions } from '../services/apiService';

const TeamsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
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
      } catch (error) {
        setError('Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [selectedCompetition]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Teams</h1>
      <select onChange={(e) => setSelectedCompetition(e.target.value)} value={selectedCompetition}>
        {competitions.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
          </option>
        ))}
      </select>
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            {team.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamsPage;
