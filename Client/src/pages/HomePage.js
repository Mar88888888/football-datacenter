import React, { useEffect, useState, useContext } from 'react';
import '../styles/global.css';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let url = `${process.env.REACT_APP_API_URL}/matches${user ? '/my/' + user.id : '?limit=100'}`;
      fetch(url)
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
      <h3 className="title">Today Matches</h3>
      <ul className="matches-list">
        {matches.map(match => (
          <li className="match-item list-item" key={match.id}>
            <div className="team-match">
              <Link to={`/teams/${match.homeTeam.id}`}>
                <img src={`https://www.sofascore.com/api/v1/team/${match.homeTeam.id}/image`} alt="Home Team Logo" className="team-crest" />
                <div className="team-name">{match.homeTeam.shortName}</div>
              </Link>
            </div>
            <div className="match-time-date">
              <span className="match-date">Matchday {match.roundInfo?.round}</span>
              <span className="match-time">{formatTime(new Date(match.startTimestamp * 1000))}</span>
              <span className="match-date">{formatDateOnly(new Date(match.startTimestamp * 1000))}</span>
              {match.status.type === "notstarted"? (
                <span className='match-score'>vs</span>
              ) : (
                <span className='match-score'>{match.homeScore.current} - {match.awayScore.current}</span>
              )}
            </div>
            <div className="team-match">
              <Link to={`/teams/${match.awayTeam.id}`}>
                <img src={`https://www.sofascore.com/api/v1/team/${match.awayTeam.id}/image`} alt="Away Team Logo" className="team-crest" />
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
