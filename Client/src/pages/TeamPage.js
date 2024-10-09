import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import '../styles/TeamPage.css';
import '../styles/global.css'; 
import { fetchPlayers } from '../services/apiService';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TeamPage = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [lastMatches, setLastMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = useState(false);


  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/teams/${id}`);
        if (response.status === 404) {
          setError('Team not found.');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setTeam(data);
        setError(null);  // clear any previous errors
      } catch (err) {
        setError('Failed to fetch team data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/matches/forteam/${id}?limit=10`)
        .then(res => res.json())
        .then(data => setScheduledMatches(data.next))
        .catch(err => console.error('Error fetching matches:', err));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/matches/forteam/${id}?status=FINISHED`)
        .then(res => res.json())
        .then(data => setLastMatches(data.last.slice(Math.max(data.last.length - 11, 0), data.last.length)))
        .catch(err => console.error('Error fetching matches:', err));
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      setIsFavourite(false);
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/user/favteam`,
            { withCredentials: true } )
        .then(response => {
            const isFav = response.data.some(favTeam => favTeam.id === +id);
            setIsFavourite(isFav);
        })
        .catch(error => {
            console.error("There was an error fetching the favourite competitions!", error);
        });
  }, [id, user]);

  useEffect(() => {
    if (!team) return;

    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers(team.id);
        setPlayers(data);
      } catch (error) {
        setError('Failed to fetch players');
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [team]);

  const handleAddToFavourite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/user/favteam/${team.id}`,
          {},
          { withCredentials: true } 
      );
      setIsFavourite(true);

      if (response.status === 201) {
        alert(`${team.name} has been added to your favourites!`);
      } else {
        console.log(response.status);
        alert('Failed to add to favourites.');
      }
    } catch (error) {
        console.error('Error adding to favourites:', error);
        alert('An error occurred. Please try again later.');
    }
  };

  const handleRemoveFromFavourite = () => {
    axios.delete(`${process.env.REACT_APP_API_URL}/user/favteam/${team.id}`,
          { withCredentials: true })
        .then(response => {
            setIsFavourite(false);
            alert(`${team.name} has been removed from your favourites!`);
        })
        .catch(error => {
            console.error("There was an error removing the competition from favourites!", error);
        });
  };

  if (loading) return <div className="loading-message">Loading...</div>;

  if (error) return <div className="error-message">{error}</div>;

  if (!team) return null;


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
              <p><strong>Club Colors:</strong> <span style={{
                backgroundColor: `${team.clubColors}`, 
                width: '50px', 
                height: '0.5em',
                border: '1px solid black',
                display: 'inline-block',
              }}></span></p>
              <p><strong>City:</strong> {team.address}</p>
            </div>
          </div>
          <div className="coach-info">
            <h3>Coach</h3>
            <p>{team.coachName}</p>
          </div>

          <div className="website-button">
            {isFavourite ? (
                <button 
                    className="add-to-favourite-btn"
                    onClick={handleRemoveFromFavourite}
                >
                    Remove from favourites
                </button>
            ) : (
                <button 
                    className="add-to-favourite-btn"
                    onClick={handleAddToFavourite}
                >
                    Add to favourite
                </button>
            )}
          </div>
        </div>
      </div>
      <div className="players-squad container">
        <h3>Players Squad</h3>
        <ul className="players-list">
          {players.map((player) => (
            <li key={player.player.id} className="player-item">
              {player.player.name} - {player.player.position}
            </li>
          ))}
        </ul>
      </div>
      <div className="container">
        <span className='container-content'>
        <h3  className="title">Competitions</h3>
        <ul className="list">
          {team.competitions.map(comp => (
            <li className="list-item" key={comp.id}>
              <Link to={`/competitions/${comp.id}`}>{comp.name}</Link>
            </li>
          ))}
        </ul>
        <h3 className="title">Scheduled Matches</h3>
        <ul className="matches-list">
          {scheduledMatches.map(match => (
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

        {lastMatches.length === 0 ?('') : (
          <h3 className="title">Last Matches</h3>
        )}  
        <ul className="matches-list">
          {lastMatches.map(match => (
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

        </span>
      </div>
      

    </div>



  );
};

export default TeamPage;
