import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  if (!competition) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-2xl text-slate-400">Loading...</div>
    </div>
  );

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

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Competition Header */}
      <div className="bg-slate-950 py-8 px-4">
        <div className="max-w-md mx-auto bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl text-center">
          <div className="flex flex-col items-center gap-4">
            <img
              src={competition.emblem}
              alt="Competition Logo"
              className="w-24 h-24 object-contain"
            />
            <h2 className="text-2xl font-bold text-white">{competition.name}</h2>
          </div>

          <div className="mt-6">
            {isFavourite ? (
              <button
                onClick={handleRemoveFromFavourite}
                className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-medium"
              >
                Remove from favourites
              </button>
            ) : (
              <button
                onClick={handleAddToFavourite}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium"
              >
                Add to favourites
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <LeagueTable competitionId={id} />

          <h3 className="text-3xl font-bold text-center text-white mt-12 mb-6">
            Scheduled Matches
          </h3>
          <div className="max-w-2xl mx-auto">
            <MatchList matches={scheduledMatches} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;
