import React, { useEffect, useState } from 'react';
import { fetchTeams, fetchCompetitions } from '../services/apiService';
import '../styles/global.css'

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

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="container">
      <h1 className="title">Teams</h1>
      <div className="select-container">
        <select className="select-item" onChange={(e) => setSelectedCompetition(e.target.value)} value={selectedCompetition}>
          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {competition.name}
            </option>
          ))}
        </select>
      </div>
      <ul className="list">
        {teams.map((team) => (
          <li key={team.id} className="list-item">
            {team.name}
          </li>
        ))}
      </ul>
    </div>

  );
};

export default TeamsPage;
