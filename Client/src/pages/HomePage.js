import React, { useEffect, useState, useContext } from 'react';
import '../styles/global.css';
import { AuthContext } from '../context/AuthContext';
import MatchList from '../components/MatchList';
import TopLeagues from '../components/TopLeagues.js';

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let url = `${process.env.REACT_APP_API_URL}/matches${user ? '/my/' + user.id : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(err => console.error('Error fetching matches:', err));
  }, [user]);

  useEffect(() => {
    let url = `${process.env.REACT_APP_API_URL}/competition/top`;
    fetch(url)
      .then(res => res.json())
      .then(data => setLeagues(data))
      .catch(err => console.error('Error fetching top leagues:', err));
  }, []);

  return (
    <div>
      <TopLeagues leagues={leagues} />
      <div className="container">
        <span className='container-content'>
          <h3 className="title">Today Matches</h3>
          <MatchList matches={matches} />
        </span>
      </div>
    </div>
  );
};

export default HomePage;
