import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MatchList.css'

const TopLeagues = ({ leagues }) => {
  return (
      <div className="players-squad container">
        <h3>Top Leagues</h3>
        <ul className="players-list">
          {leagues.map((league) => (
            <Link to={`/competitions/${league.id}`}><li key={league.id} className="player-item">
              <img 
                src={league.crest ? league.crest : league.emblem} 
                alt={league.name} 
                className="emblem"
                style={{ width: '25px', height: '25px', marginRight: '5px' }}
              />
              {league.name}
            </li></Link>
          ))}
        </ul>
      </div>
  );
};

export default TopLeagues;
