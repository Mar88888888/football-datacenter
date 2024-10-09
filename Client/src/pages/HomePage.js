import React, { useEffect, useState, useContext } from 'react';
import '../styles/global.css';
import { AuthContext } from '../context/AuthContext';
import MatchList from '../components/MatchList';

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let url = `${process.env.REACT_APP_API_URL}/matches${user ? '/my/' + user.id : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(err => console.error('Error fetching matches:', err));
  }, [user]);

  return (
    <div className="container">
      <h3 className="title">Today Matches</h3>
      <MatchList matches={matches} />
    </div>
  );
};

export default HomePage;
