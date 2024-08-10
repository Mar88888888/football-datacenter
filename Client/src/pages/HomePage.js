import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Football Datacenter</h1>
        <p>Welcome to the Football Datacenter! Your ultimate source for exploring football competitions, teams, and players from around the globe.</p>
      </header>
      <nav className="home-nav">
        <ul className="home-menu">
          <li><Link to="/competitions">Competitions</Link></li>
          <li><Link to="/teams">Teams</Link></li>
          <li><Link to="/players">Players</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
