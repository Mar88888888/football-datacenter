import React, { useEffect, useState, useContext } from 'react';
import '../styles/global.css';
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
    <div>
      <div className="container">
        <span className="container-content">
          <h3 className="title">Today Matches</h3>
          <MatchList matches={matches} />
        </span>
      </div>
    </div>
  );
};

export default HomePage;
