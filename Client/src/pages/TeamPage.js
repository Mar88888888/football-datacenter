import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import '../styles/TeamPage.css';
import '../styles/global.css'; 
import { fetchPlayers } from '../services/apiService';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MatchList from '../components/MatchList';
import ErrorPage from './ErrorPage';

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
        setError(null);  
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
        .catch((err) => {
            setError(true)
            console.error(err);
          });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/matches/forteam/${id}?status=FINISHED`)
        .then(res => res.json())
        .then(data => setLastMatches(data.last.slice(Math.max(data.last.length - 11, 0), data.last.length)))
        .catch((err) => {
            setError(true)
            console.error(err);
          });
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
        .catch((err) => {
            setError(true)
            console.error(err);
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
        setError(true)
        console.error('Error adding to favourites:', error);
        alert('An error occurred. Please try again later.');
    }
  };

  const handleRemoveFromFavourite = () => {
    axios.delete(`${process.env.REACT_APP_API_URL}/user/favteam/${team.id}`,
          { withCredentials: true })
        .then(_ => {
            setIsFavourite(false);
            alert(`${team.name} has been removed from your favourites!`);
        })
        .catch((err) => {
            setError(true)
            console.error(err);
          });
  };

  if (loading) return <div className="loading-message">Loading...</div>;

  if (error || !team) {
    return <ErrorPage />;
  }

  return (
    <div className="team-page-container">
      <div className="passport-container">
        <div className="team-passport">
          <div className="team-info">
            <div className="team-photo">
              <img src={team.crest} alt="Team Logo" />
            </div>
            <div className="team-details">
              <h2>{team.name}</h2>
              {team.founded !== 'NaN/NaN/NaN' ? (
                <p><strong>Founded:</strong> {team.founded}</p>
              ) : (
                ''
              )}
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

          <div>
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
              <Link to={`/players/${player.player.id}`}>
              {player.player.name} - {player.player.position}
              </Link>
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
        <MatchList matches={scheduledMatches} />

        {lastMatches.length === 0 ?('') : (
          <h3 className="title">Last Matches</h3>
        )}  
        <MatchList matches={lastMatches} />
        </span>
      </div>
    </div>

  );
};

export default TeamPage;
