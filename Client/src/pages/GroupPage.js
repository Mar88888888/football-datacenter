import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import MatchList from '../components/MatchList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';

const TeamCell = ({ team, isNationalTeam }) => {
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

const GroupPage = () => {
  const { competitionId, groupName } = useParams();

  // Decode the group name from URL (e.g., "Group%20A" -> "Group A")
  const decodedGroupName = decodeURIComponent(groupName);

  // Fetch data with automatic 202 retry
  const {
    data: competition,
    loading: loadingComp,
    error: compError,
  } = useApi(API_ENDPOINTS.COMPETITION(competitionId));

  const {
    data: standings,
    loading: loadingStandings,
    error: standingsError,
  } = useApi(API_ENDPOINTS.STANDINGS(competitionId));

  const {
    data: matchesData,
    loading: loadingMatches,
    error: matchesError,
  } = useApi(API_ENDPOINTS.COMPETITION_MATCHES(competitionId));

  // Ensure matches is always an array
  const matches = matchesData || [];

  const loading = loadingComp || loadingStandings || loadingMatches;
  const error = compError || standingsError || matchesError;

  // Determine if team links should be disabled (national teams or competitions with teams outside our API plan)
  const disableTeamLinks = useMemo(() => {
    if (!competition) return false;
    const disabledCodes = ['WC', 'EC', 'CAF', 'AFC', 'CONMEBOL', 'CONCACAF', 'CLI'];
    const disabledPatterns = ['World Cup', 'European Championship', 'Euro 20', 'Copa America', 'Africa Cup', 'Asian Cup', 'Libertadores'];
    const isDisabledByCode = disabledCodes.includes(competition.code);
    const isDisabledByName = disabledPatterns.some(pattern =>
      competition.name?.includes(pattern)
    );
    return isDisabledByCode || isDisabledByName;
  }, [competition]);

  // Find the specific group standings
  const groupStandings = useMemo(() => {
    if (!standings?.standings) return null;
    return standings.standings.find(s => s.group === decodedGroupName);
  }, [standings, decodedGroupName]);

  // Get team IDs in this group
  const groupTeamIds = useMemo(() => {
    if (!groupStandings?.table) return new Set();
    return new Set(groupStandings.table.map(item => item.team.id));
  }, [groupStandings]);

  // Filter matches for this group - by checking if both teams are in the group
  const groupMatches = useMemo(() => {
    if (!matches || matches.length === 0 || groupTeamIds.size === 0) return [];

    return matches.filter(match => {
      // First try direct group match
      if (match.group === decodedGroupName) return true;

      // Also check for GROUP_X format (e.g., "GROUP_A" matches "Group A")
      const normalizedMatchGroup = match.group?.replace('GROUP_', 'Group ').replace('_', ' ');
      if (normalizedMatchGroup === decodedGroupName) return true;

      // Fallback: check if both teams are in this group (for group stage matches)
      const isGroupStage = !match.stage || match.stage === 'GROUP_STAGE' || match.stage === 'REGULAR_SEASON';
      if (isGroupStage && match.homeTeam?.id && match.awayTeam?.id) {
        return groupTeamIds.has(match.homeTeam.id) && groupTeamIds.has(match.awayTeam.id);
      }

      return false;
    });
  }, [matches, decodedGroupName, groupTeamIds]);

  if (loading) {
    return <LoadingSpinner message="Loading group data..." />;
  }

  if (error || !groupStandings) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Link
              to={`/competitions/${competitionId}`}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to {competition?.name || 'Competition'}
            </Link>
          </div>

          {/* Group Header Card */}
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="bg-slate-900/50 px-8 py-6 border-b border-slate-700/50">
              <div className="flex items-center gap-6">
                {competition?.emblem && (
                  <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg flex-shrink-0">
                    <img src={competition.emblem} alt={competition.name} className="w-12 h-12 object-contain" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-sm">{competition?.name}</p>
                  <h1 className="text-3xl font-bold text-white">{decodedGroupName}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Standings Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg mb-8">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Standings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs uppercase text-slate-400">
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3 text-left">Team</th>
                    <th className="p-3 text-center">P</th>
                    <th className="p-3 text-center">W</th>
                    <th className="p-3 text-center">D</th>
                    <th className="p-3 text-center">L</th>
                    <th className="p-3 text-center">GF</th>
                    <th className="p-3 text-center">GA</th>
                    <th className="p-3 text-center">GD</th>
                    <th className="p-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStandings.table.map((item, index) => (
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
                      <td className="p-3 text-center text-slate-300 font-medium">
                        {item.position}
                      </td>
                      <td className="p-3">
                        <TeamCell team={item.team} isNationalTeam={disableTeamLinks} />
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-bold text-sm">
                          {item.playedGames}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-300">{item.won}</td>
                      <td className="p-3 text-center text-slate-300">{item.draw}</td>
                      <td className="p-3 text-center text-slate-300">{item.lost}</td>
                      <td className="p-3 text-center text-slate-300">{item.goalsFor}</td>
                      <td className="p-3 text-center text-slate-300">{item.goalsAgainst}</td>
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

          {/* Matches Section */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Matches</h2>
            </div>
            <div className="p-4">
              {groupMatches.length > 0 ? (
                <MatchList matches={groupMatches} isNationalTeam={disableTeamLinks} pageSize={10} />
              ) : (
                <p className="text-slate-400 text-center py-8">No matches found for this group</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
