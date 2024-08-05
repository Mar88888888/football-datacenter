import axios from 'axios';

const API_URL = 'http://localhost:3000/fdc-api';

export const fetchCompetitions = async () => {
  try {
    const url = `${API_URL}/competition`;
    console.log(url);
    const response = await axios.get(url);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching competitions:', error);
    throw error;
  }
};

export const fetchTeams = async (competitionId) => {
  try {
    const response = await axios.get(`${API_URL}/competition/${competitionId}/teams`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const fetchPlayers = async (teamId) => {
  try {
    const response = await axios.get(`${API_URL}/players/fromteam/${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};
