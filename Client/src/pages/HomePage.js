import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MatchList from '../components/MatchList';
import ErrorPage from './ErrorPage';

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url = `${process.env.REACT_APP_API_URL}/matches`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  }, [user]);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-4xl font-bold text-center text-white mb-8">
          Today's Matches
        </h3>
        <MatchList matches={matches} />
      </div>
    </div>
  );
};

export default HomePage;
