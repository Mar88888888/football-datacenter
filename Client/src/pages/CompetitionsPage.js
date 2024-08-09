import React, { useEffect, useState } from 'react';
import { fetchCompetitions } from '../services/apiService';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Competitions</h1>
      <ul>
        {competitions.map((competition) => (
          <li key={competition.id}>
            {competition.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompetitionsPage;
