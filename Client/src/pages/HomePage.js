import React, { useEffect, useState } from 'react';
import '../styles/global.css';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [matches, setMatches] = useState([]);


  useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/matches?limit=100`)
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error('Error fetching matches:', err));
  }, []);

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
    <div className="container">
      <h1 className="title">Welcome to the Sports Dashboard</h1>
      <h3 className="title">Today Matches</h3>
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
              {match.status === "FINISHED" || match.status === "IN_PLAY" ? (
                <span className='match-score'>{match.score.fullTime.home} - {match.score.fullTime.away}</span>
              ) : (
                <span className='match-score'>vs</span>
              )}  
            </div>
            <div className="team-match">
              <Link to={`/teams/${match.awayTeam.id}`}>
                <img src={match.awayTeam.crest} alt="Away Team Logo" className="team-crest" />
                <div className="team-name">{match.awayTeam.shortName}</div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
