import React, { useState } from 'react';
import axios from 'axios';
import '../styles/global.css';

const HomePage = () => {
  const [news, setNews] = useState('');

  const fetchNews = async () => {
    try {
      const params = {
        prompt: "Write the latest football news",
        max_tokens: 100
      };
      const headers = {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-002/completions', params, { headers });
      setNews(response.data.choices[0].text);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews('Failed to fetch news.');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Welcome to the Sports Dashboard</h1>
      {/* <button onClick={fetchNews}>Get Latest News</button> */}
      <p className="loading-message">{news || 'Select a category from the menu above to explore your favorite teams, competitions, and players.'}</p>
    </div>
  );
};

export default HomePage;
