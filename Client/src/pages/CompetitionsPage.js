import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/global.css';
import { Link } from 'react-router-dom';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/competition`, { withCredentials: true });
        setCompetitions(response.data);
      } catch (error) {
        setError('Error fetching competitions');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  if (loading) {
    return <p className="loading-message">Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="title">Competitions</h1>
      <ul className="list">
        {competitions.map((comp) => (
          <li key={comp.id} className="list-item">
            <Link to={`/competitions/${comp.id}`}>{comp.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompetitionsPage;
