import React, { useEffect, useState } from 'react';
import '../styles/LeagueTable.css'

const LeagueTable = ({ leagueId }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/fdc-api/tables/${leagueId}`);
        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error("Error fetching the league table data:", error);
      }
    };

    fetchTableData();
  }, [leagueId]);

  return (
    <div className="league-table">
      {tableData.length == 0 ? (
        ''
      ):(
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
            {tableData.map((team, index) => (
              <tr key={index}>
                <td>{index+1}</td>
                <td>{team.Team}</td>
                <td>{team.Played}</td>
                <td>{team.Won}</td>
                <td>{team.Drawn}</td>
                <td>{team.Lost}</td>
                <td>{team['Goals For']}</td>
                <td>{team['Goals Against']}</td>
                <td>{team['Goals Difference']}</td>
                <td>{team.Points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeagueTable;
