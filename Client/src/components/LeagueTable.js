import { useEffect, useState } from 'react';
import '../styles/LeagueTable.css';
import ErrorPage from '../pages/ErrorPage';

const LeagueTable = ({ competitionId }) => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/fdc-api/standings/${competitionId}`
        );
        const data = await response.json();
        setTableData(data.standings[0].table);
      } catch (error) {
        setError(true);
        console.error('Error fetching the league table data:', error);
      }
    };

    fetchTableData();
  }, [competitionId]);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="league-table">
      {tableData.length === 0 ? (
        ''
      ) : (
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Team</th>
              <th>Played</th>
              <th>Won</th>
              <th>Draw</th>
              <th>Lost</th>
              <th>Goals Scored</th>
              <th>Goals Conceded</th>
              <th>Goal Difference</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.team.name}</td>
                <td>{item.playedGames}</td>
                <td>{item.won}</td>
                <td>{item.draw}</td>
                <td>{item.lost}</td>
                <td>{item.goalsFor}</td>
                <td>{item.goalsAgainst}</td>
                <td>{item.goalDifference}</td>
                <td>{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeagueTable;
