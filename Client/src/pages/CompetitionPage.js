import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/CompetitionPage.css'; 
import '../styles/global.css'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CompetitionPage = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/competition/${id}`)
      .then((res) => res.json())
      .then((data) => setCompetition(data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (!user) {
        setIsFavourite(false);
        return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/user/favcomp`,
            { withCredentials: true } )
        .then(response => {
            const isFav = response.data.some(favComp => favComp.id === +id);
            setIsFavourite(isFav);
        })
        .catch(error => {
            console.error("There was an error fetching the favourite competitions!", error);
        });
  }, [id, user]);
  
  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/matches/forcomp/${id}?status=SCHEDULED&limit=10`)
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error('Error fetching matches:', err));
    }
  }, [id]);

  if (!competition) return <div className="loading-message">Loading...</div>;

  const handleAddToFavourite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/user/favcomp/${competition.id}`,
          {},
          { withCredentials: true } 
      );
      setIsFavourite(true);

      if (response.status === 201) {
        alert(`${competition.name} has been added to your favourites!`);
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
    axios.delete(`${process.env.REACT_APP_API_URL}/user/favcomp/${competition.id}`,
          { withCredentials: true })
        .then(response => {
            setIsFavourite(false);
            alert(`${competition.name} has been removed from your favourites!`);
        })
        .catch(error => {
            console.error("There was an error removing the competition from favourites!", error);
        });
  };

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
                {match.status === "FINISHED" || match.status === "IN_PLAY" ? (
                  <span className='match-score'>{match.score.fullTime.home} - {match.score.fullTime.away}</span>
                ) : (
                  <span className='match-score'>vs</span>
                )}  
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
