import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Football Datacenter</h1>
      <p>Welcome to the Football Datacenter! Explore competitions, teams, and players.</p>
      <nav>
        <ul>
          <li><Link to="/competitions">Competitions</Link></li>
          <li><Link to="/teams">Teams</Link></li>
          <li><Link to="/players">Players</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
