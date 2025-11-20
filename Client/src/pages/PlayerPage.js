import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/PlayerPage.css';
import ErrorPage from './ErrorPage';

const PlayerPage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateAge = (birthTimestamp) => {
    const birthDate = new Date(birthTimestamp * 1000);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/players/${id}`
        );
        setPlayer(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch player data.');
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) {
    return <ErrorPage />;
  }

  const dateOfBirth = new Date(
    player.dateOfBirthTimestamp * 1000
  ).toLocaleDateString();

  const playerAge = calculateAge(player.dateOfBirthTimestamp);

  return (
    <div className="team-page-container">
      <div className="passport-container">
        <div className="team-passport">
          <div className="team-info">
            <div className="player-photo">
              <img src={player.photo} alt={player.name} />
            </div>
            <div className="team-details">
              <div className="player-details">
                <h2>{player.name}</h2>
                <p>
                  <strong>Height:</strong> {player.height} cm
                </p>
                <p>
                  <strong>Preferred Foot:</strong> {player.preferredFoot}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {dateOfBirth} ({playerAge}{' '}
                  years)
                </p>
                <p>
                  <strong>Market Value:</strong> €
                  {player.proposedMarketValue.toLocaleString()}
                </p>
                <p>
                  <strong>Position:</strong>
                  {player.position}
                </p>
              </div>
              <div className="country-info">
                <h3>Country</h3>
                <p>{player.country.name}</p>
                <img
                  src={`https://flagcdn.com/w80/${player.country.alpha2.toLowerCase()}.png`}
                  alt={`${player.country.name} flag`}
                />
              </div>
            </div>
          </div>
          <div className="shirt-container">
            <div className="shirt">
              <div className="sleeve-left"></div>
              <div className="sleeve-right"></div>
              <span className="shirt-number">{player.shirtNumber}</span>
            </div>
          </div>
          {/* <div>
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
                </div> */}
        </div>
      </div>

      <div className="container">
        <div className="player-team">
          <h3 className="title">Team</h3>
          <ul className="list">
            <Link to={`/teams/${player.team.id}`}>
              <li className="list-item team-item" key={player.team.id}>
                <img
                  src={`https://api.sofascore.app/api/v1/team/${player.team.id}/image`}
                  alt={`${player.country.name} flag`}
                />
                <div className="team">
                  <h3>{player.team.name}</h3>
                  <p>
                    <strong>Contract Until:</strong>{' '}
                    {new Date(
                      player.contractUntilTimestamp * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
