import axios from 'axios';


const url = process.env.REACT_APP_API_URL;

export const fetchCompetitions = async () => {
  try {
    const response = await axios.get(`${url}/competition`);
    return response.data;
  } catch (error) {
    console.error('Error fetching competitions:', error);
    throw error;
  }
};

export const fetchTeams = async (competitionId) => {
  try {
    const response = await axios.get(`${url}/competition/${competitionId}/teams`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const fetchPlayers = async (teamId) => {
  try {
    const response = await axios.get(`${url}/players/fromteam/${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};
