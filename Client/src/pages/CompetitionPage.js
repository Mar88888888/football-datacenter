import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/TeamPage.css';
import '../styles/global.css'; 

const CompetitionPage = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/teams/${id}`)
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/matches/forteam/${id}?status=SCHEDULED&limit=10`)
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
    <div className="team-page-container">
      <div className="team-passport-container">
        <div className="team-passport">
          <div className="team-info">
            <div className="team-photo">
              <img src={team.crest} alt="Team Logo" />
            </div>
            <div className="team-details">
              <h2>{team.name}</h2>
              <p><strong>Founded:</strong> {team.founded}</p>
              <p><strong>Club Colors:</strong> {team.clubColors}</p>
              <p><strong>Venue:</strong> {team.venue}</p>
              <p><strong>Address:</strong> {team.address}</p>
            </div>
          </div>
          <div className="coach-info">
            <h3>Coach</h3>
            <p>{team.coach.name}</p>
          </div>
          <div className="website-button">
            <a href={team.website} target="_blank" rel="noopener noreferrer">Official Website</a>
          </div>
        </div>
      </div>
      <div className="players-squad container">
        <h3>Players Squad</h3>
        <ul className="players-list">
          {players.map((player) => (
            <li key={player.id} className="player-item">
              {player.name} - {player.position}
            </li>
          ))}
        </ul>
      </div>
      <div className="container">
        <span className='container-content'>
        <h3  className="title">Competitions</h3>
        <ul className="list">
          {team.competitions.map(comp => (
            <li className="list-item" key={comp.id}>{comp.name}</li>
          ))}
        </ul>
        <h3 className="title">Scheduled Matches</h3>
        <ul className="matches-list">
          {matches.map(match => (
            <li className="match-item list-item" key={match.id}>
              <div className="team-match">
                <img src={match.homeTeam.crest} alt="Home Team Logo" className="team-crest" />
                <div className="team-name">{match.homeTeam.shortName}</div>
              </div>
              <div className="match-time-date">
                <span className="match-time">{formatTime(match.utcDate)}</span>
                <span className="match-date">{formatDateOnly(match.utcDate)}</span>
              </div>
              <div className="team-match">
                <img src={match.awayTeam.crest} alt="Away Team Logo" className="team-crest" />
                <div className="team-name">{match.awayTeam.shortName}</div>
              </div>
            </li>
          ))}
        </ul>
        </span>
      </div>
      

    </div>



  );
};

export default TeamPage;
