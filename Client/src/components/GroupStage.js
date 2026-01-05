import { Link, useParams } from 'react-router-dom';

const TeamCell = ({ team, isNationalTeam }) => {
  // Handle null/TBD teams
  if (!team || !team.id || !team.name) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <div className="w-6 h-6 bg-slate-700 rounded p-0.5 flex items-center justify-center flex-shrink-0">
          <span className="text-xs">?</span>
        </div>
        <span className="text-sm font-medium">TBD</span>
      </div>
    );
  }

  const content = (
    <div className="flex items-center gap-2">
      {team.crest && (
        <div className="w-6 h-6 bg-white rounded p-0.5 flex items-center justify-center flex-shrink-0">
          <img
            src={team.crest}
            alt={team.shortName || team.name}
            className="w-5 h-5 object-contain"
          />
        </div>
      )}
      <span className="text-sm font-medium truncate">
        {team.shortName || team.name}
      </span>
    </div>
  );

  if (isNationalTeam) {
    return <div className="text-slate-200">{content}</div>;
  }

  return (
    <Link
      to={`/teams/${team.id}`}
      className="text-slate-200 hover:text-blue-400 transition-colors"
    >
      {content}
    </Link>
  );
};

const LeaguePhaseTable = ({ table, isNationalTeam }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <thead className="sticky top-0">
          <tr className="bg-slate-900">
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider w-12">
              #
            </th>
            <th className="p-3 text-left text-sm font-bold text-white uppercase tracking-wider">
              Team
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              P
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              W
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              D
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              L
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              GF
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              GA
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              GD
            </th>
            <th className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider">
              Pts
            </th>
          </tr>
        </thead>
        <tbody>
          {table.map((item, index) => (
            <tr
              key={item.team.id}
              className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${
                index < 8
                  ? 'bg-green-900/20'
                  : index < 24
                  ? 'bg-yellow-900/20'
                  : 'bg-slate-800'
              }`}
            >
              <td className="p-3 text-center text-slate-200 font-medium">
                {item.position}
              </td>
              <td className="p-3">
                <TeamCell team={item.team} isNationalTeam={isNationalTeam} />
              </td>
              <td className="p-3 text-center">
                <span className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-bold">
                  {item.playedGames}
                </span>
              </td>
              <td className="p-3 text-center text-slate-300">{item.won}</td>
              <td className="p-3 text-center text-slate-300">{item.draw}</td>
              <td className="p-3 text-center text-slate-300">{item.lost}</td>
              <td className="p-3 text-center text-slate-300">
                {item.goalsFor}
              </td>
              <td className="p-3 text-center text-slate-300">
                {item.goalsAgainst}
              </td>
              <td className="p-3 text-center">
                <span
                  className={
                    item.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'
                  }
                >
                  {item.goalDifference > 0 ? '+' : ''}
                  {item.goalDifference}
                </span>
              </td>
              <td className="p-3 text-center">
                <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-400 rounded font-bold">
                  {item.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500/30 rounded"></span>
          Round of 16
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-500/30 rounded"></span>
          Knockout Playoffs
        </span>
      </div>
    </div>
  );
};

const GroupStage = ({ standings, isNationalTeam = false }) => {
  const { id: competitionId } = useParams();

  const leaguePhase = standings.find(
    (s) => s.group === 'League phase' || s.group === 'League Phase'
  );

  if (leaguePhase) {
    return (
      <div className="w-full max-w-6xl mx-auto my-8">
        <Link
          to={`/competitions/${competitionId}/groups/${encodeURIComponent(leaguePhase.group)}`}
          className="flex items-center justify-center gap-2 mb-6 group"
        >
          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
            League Phase
          </h3>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
        <LeaguePhaseTable
          table={leaguePhase.table}
          isNationalTeam={isNationalTeam}
        />
      </div>
    );
  }

  const groupStandings = standings.filter(
    (s) =>
      s.group && (s.group.startsWith('Group ') || s.group.startsWith('GROUP_'))
  );

  if (groupStandings.length === 0) {
    return null;
  }

  const sortedGroups = [...groupStandings].sort((a, b) =>
    a.group.localeCompare(b.group)
  );

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <h3 className="text-2xl font-bold text-white text-center mb-6">
        Group Stage
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedGroups.map((group) => (
          <div
            key={group.group}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg"
          >
            <Link
              to={`/competitions/${competitionId}/groups/${encodeURIComponent(group.group)}`}
              className="block bg-slate-900 px-4 py-3 border-b border-slate-700 hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">
                  {group.group.replace('_', ' ').replace('GROUP ', 'Group ')}
                </h4>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs uppercase text-slate-400">
                    <th className="p-2 text-center w-8">#</th>
                    <th className="p-2 text-left">Team</th>
                    <th className="p-2 text-center">P</th>
                    <th className="p-2 text-center">W</th>
                    <th className="p-2 text-center">D</th>
                    <th className="p-2 text-center">L</th>
                    <th className="p-2 text-center">GD</th>
                    <th className="p-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.table.map((item, index) => (
                    <tr
                      key={item.team.id}
                      className={`border-t border-slate-700/50 ${
                        index < 2
                          ? 'bg-green-900/20'
                          : index === 2
                          ? 'bg-yellow-900/20'
                          : ''
                      } hover:bg-slate-700/50 transition-colors`}
                    >
                      <td className="p-2 text-center text-slate-300 font-medium">
                        {item.position}
                      </td>
                      <td className="p-2">
                        <TeamCell
                          team={item.team}
                          isNationalTeam={isNationalTeam}
                        />
                      </td>
                      <td className="p-2 text-center text-slate-300 text-sm">
                        {item.playedGames}
                      </td>
                      <td className="p-2 text-center text-slate-300 text-sm">
                        {item.won}
                      </td>
                      <td className="p-2 text-center text-slate-300 text-sm">
                        {item.draw}
                      </td>
                      <td className="p-2 text-center text-slate-300 text-sm">
                        {item.lost}
                      </td>
                      <td className="p-2 text-center text-sm">
                        <span
                          className={
                            item.goalDifference >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {item.goalDifference > 0 ? '+' : ''}
                          {item.goalDifference}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-400 rounded font-bold text-sm">
                          {item.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700/50 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500/50 rounded-full"></span>
                Knockout Stage
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500/50 rounded-full"></span>
                Playoff
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupStage;
