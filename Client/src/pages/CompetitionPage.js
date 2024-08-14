import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/CompetitionPage.css'; 
import '../styles/global.css'; 
import { Link } from 'react-router-dom';

const CompetitionPage = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/competition/${id}`)
      .then((res) => res.json())
      .then((data) => setCompetition(data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/matches/forcomp/${id}?status=SCHEDULED&limit=10`)
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error('Error fetching matches:', err));
    }
  }, [id]);

  if (!competition) return <div className="loading-message">Loading...</div>;

  const formatTime = (utcDate) => {
    if(!utcDate){
      return 'Not Set';
    }
    const date = new Date(utcDate);
    return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDateOnly = (utcDate) => {
    const date = new Date(utcDate);
    return date.toLocaleDateString();
  };

  return (
    <div className="competition-page-container">
      <div className="competition-passport-container">
        <div className="competition-passport">
          <div className="competition-info">
            <div className="competition-photo">
              <img src={competition.emblem} alt="Competition Logo" />
            </div>
            <div className="competition-details">
              <h2>{competition.name}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <h3 className="title">Scheduled Matches</h3>
        <ul className="matches-list">
          {matches.map(match => (
            <li className="match-item list-item" key={match.id}>
              <div className="team-match">
                <Link to={`/teams/${match.homeTeam.id}`}>
                  <img src={match.homeTeam.crest} alt="Home Team Logo" className="team-crest" />
                  <div className="team-name">{match.homeTeam.shortName}</div>
                </Link>
              </div>
              <div className="match-time-date">
                <span className="match-time">{formatTime(match.utcDate)}</span>
                <span className="match-date">{formatDateOnly(match.utcDate)}</span>
              </div>
              <div className="team-match">
                <Link to={`/teams/${match.homeTeam.id}`}>
                  <img src={match.awayTeam.crest} alt="Away Team Logo" className="team-crest" />
                  <div className="team-name">{match.awayTeam.shortName}</div>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompetitionPage;
