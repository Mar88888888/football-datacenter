import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/CompetitionPage.css';
import '../styles/global.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LeagueTable from '../components/LeagueTable';
import MatchList from '../components/MatchList';
import ErrorPage from './ErrorPage';

const CompetitionPage = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [error, setError] = useState(false);
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/competitions/${id}`)
      .then((res) => res.json())
      .then((data) => setCompetition(data))
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  }, [id]);

  useEffect(() => {
    if (!user) {
      setIsFavourite(false);
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/user/favcomp`, {
        withCredentials: true,
      })
      .then((response) => {
        const isFav = response.data.some((favComp) => favComp.id === +id);
        setIsFavourite(isFav);
      })
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/competitions/${id}/matches`)
        .then((res) => res.json())
        .then((data) => setScheduledMatches(data))
        .catch((err) => {
          setError(true);
          console.error(err);
        });
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
      setError(true);
      console.error('Error adding to favourites:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handleRemoveFromFavourite = () => {
    axios
      .delete(
        `${process.env.REACT_APP_API_URL}/user/favcomp/${competition.id}`,
        { withCredentials: true }
      )
      .then((response) => {
        setIsFavourite(false);
        alert(`${competition.name} has been removed from your favourites!`);
      })
      .catch((error) => {
        setError(true);
        console.error(
          'There was an error removing the competition from favourites!',
          error
        );
      });
  };

  const formatTime = (utcDate) => {
    if (!utcDate) {
      return 'Not Set';
    }
    const date = new Date(utcDate);
    return `${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatDateOnly = (utcDate) => {
    const date = new Date(utcDate);
    return date.toLocaleDateString();
  };

  if (error) {
    return <ErrorPage />;
  }

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
        <LeagueTable competitionId={id} />
        <h3 className="title">Scheduled Matches</h3>
        <MatchList matches={scheduledMatches} />
      </div>
    </div>
  );
};

export default CompetitionPage;
