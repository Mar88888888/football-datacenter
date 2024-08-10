import React, { useEffect, useState } from 'react';
import { fetchCompetitions } from '../services/apiService';
import './CompetitionsPage.css';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const data = await fetchCompetitions();
        setCompetitions(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, []);

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="competitions-container">
      <h1 className="competitions-title">Competitions</h1>
      <ul className="competitions-list">
        {competitions.map((competition) => (
          <li key={competition.id} className="competitions-item">
            {competition.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompetitionsPage;

