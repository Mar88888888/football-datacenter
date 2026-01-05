import { useEffect, useState } from 'react';
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
    <div className="w-full max-w-6xl mx-auto my-8 overflow-x-auto">
      {tableData.length === 0 ? (
        ''
      ) : (
        <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <thead className="sticky top-0">
            <tr className="bg-slate-900">
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">Position</th>
              <th className="p-4 text-left text-sm font-bold text-white uppercase tracking-wider">Team</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">P</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">W</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">D</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">L</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">GF</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">GA</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">GD</th>
              <th className="p-4 text-center text-sm font-bold text-white uppercase tracking-wider">Pts</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'
                }`}
              >
                <td className="p-4 text-center text-slate-200 font-medium">{index + 1}</td>
                <td className="p-4 text-left text-slate-200 font-medium">{item.team.name}</td>
                <td className="p-4 text-center">
                  <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded font-bold">
                    {item.playedGames}
                  </span>
                </td>
                <td className="p-4 text-center text-slate-300">{item.won}</td>
                <td className="p-4 text-center text-slate-300">{item.draw}</td>
                <td className="p-4 text-center text-slate-300">{item.lost}</td>
                <td className="p-4 text-center text-slate-300">{item.goalsFor}</td>
                <td className="p-4 text-center text-slate-300">{item.goalsAgainst}</td>
                <td className="p-4 text-center text-slate-300">
                  <span className={item.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {item.goalDifference > 0 ? '+' : ''}{item.goalDifference}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded font-bold">
                    {item.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeagueTable;
