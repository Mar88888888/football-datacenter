import { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useApi, useAuthApi, useAuthMutation } from '../hooks/useApi';
import LeagueTable from '../components/LeagueTable';
import GroupStage from '../components/GroupStage';
import KnockoutBracket from '../components/KnockoutBracket';
import MatchList from '../components/MatchList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';

const CompetitionPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('standings');

  // Fetch competition data with automatic 202 retry
  const {
    data: competition,
    loading: loadingCompetition,
    error: competitionError,
  } = useApi(`/competitions/${id}`);

  // Fetch standings
  const { data: standings } = useApi(`/standings/${id}`);

  // Fetch matches
  const {
    data: scheduledMatchesData,
    error: matchesError,
  } = useApi(`/competitions/${id}/matches`);

  // Ensure scheduledMatches is always an array
  const scheduledMatches = scheduledMatchesData || [];

  // Fetch user's favourite competitions (only if logged in)
  const { data: favComps } = useAuthApi('/user/favcomp', {
    enabled: !!user,
  });

  // Mutation hook for adding/removing favourites
  const { post, delete: deleteFav, loading: mutationLoading } = useAuthMutation();

  // Derive favourite status from fetched data
  const isFavourite = useMemo(() => {
    if (!favComps || !id) return false;
    return favComps.some((favComp) => favComp.id === +id);
  }, [favComps, id]);

  const error = competitionError || matchesError;

  // Reset tab when competition changes
  useEffect(() => {
    setActiveTab('standings');
  }, [id]);

  // Determine if team links should be disabled (national teams or competitions with teams outside our API plan)
  const disableTeamLinks = useMemo(() => {
    if (!competition) return false;
    // Competition codes where team links should be disabled
    const disabledCodes = ['WC', 'EC', 'CAF', 'AFC', 'CONMEBOL', 'CONCACAF', 'CLI'];
    // Also check by name patterns
    const disabledPatterns = ['World Cup', 'European Championship', 'Euro 20', 'Copa América', 'Africa Cup', 'Asian Cup', 'Libertadores'];

    const isDisabledByCode = disabledCodes.includes(competition.code);
    const isDisabledByName = disabledPatterns.some(pattern =>
      competition.name?.includes(pattern)
    );

    return isDisabledByCode || isDisabledByName;
  }, [competition]);

  // Determine competition format from standings and matches
  const competitionFormat = useMemo(() => {
    if (!standings?.standings) return 'unknown';

    // Check for UCL league phase (single "League phase" group)
    const hasLeaguePhase = standings.standings.some(
      (s) => s.group === 'League phase' || s.group === 'League Phase'
    );

    // Check for traditional groups - "Group A", "Group B", "GROUP_A", "GROUP_B", etc.
    const hasTraditionalGroups = standings.standings.some(
      (s) => s.group && (s.group.startsWith('Group ') || s.group.startsWith('GROUP_'))
    );

    // Check for regular league (domestic leagues like EPL, La Liga)
    const hasLeagueTable = standings.standings.some(
      (s) => s.stage === 'REGULAR_SEASON' && s.type === 'TOTAL'
    );

    const hasKnockout = scheduledMatches.some(
      (m) =>
        m.stage &&
        ['ROUND_1', 'ROUND_2', 'ROUND_3', 'LAST_64', 'LAST_32', 'LAST_16', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'].includes(
          m.stage
        )
    );

    // Group + Knockout (World Cup style)
    if (hasTraditionalGroups && hasKnockout) return 'group_knockout';
    if (hasTraditionalGroups) return 'group_stage';

    // League phase + Knockout (new UCL format)
    if (hasLeaguePhase && hasKnockout) return 'group_knockout';
    if (hasLeaguePhase) return 'group_stage';

    // Pure knockout (FA Cup, Copa del Rey)
    if (hasKnockout && !hasLeagueTable) return 'knockout';

    // Regular league
    if (hasLeagueTable) return 'league';

    return 'unknown';
  }, [standings, scheduledMatches]);

  // Get knockout matches (including qualifying rounds)
  const knockoutMatches = useMemo(() => {
    return scheduledMatches.filter(
      (m) =>
        m.stage &&
        ['ROUND_1', 'ROUND_2', 'ROUND_3', 'LAST_64', 'LAST_32', 'LAST_16', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'].includes(
          m.stage
        )
    );
  }, [scheduledMatches]);

  // Get league matches (non-knockout)
  const leagueMatches = useMemo(() => {
    return scheduledMatches.filter(
      (m) => !m.stage || m.stage === 'REGULAR_SEASON' || m.stage === 'GROUP_STAGE'
    );
  }, [scheduledMatches]);

  // Set initial tab based on competition format
  useEffect(() => {
    if (competitionFormat === 'knockout') {
      setActiveTab('knockout');
    } else if (competitionFormat === 'group_knockout' || competitionFormat === 'group_stage') {
      setActiveTab('standings');
    }
  }, [competitionFormat]);

  if (loadingCompetition || !competition) {
    return <LoadingSpinner message="Loading competition data..." />;
  }

  const handleAddToFavourite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await post(`/user/favcomp/${competition.id}`, {});
      alert(`${competition.name} has been added to your favourites!`);
      window.location.reload(); // Refresh to update favourite status
    } catch (err) {
      console.error('Error adding to favourites:', err);
      alert(err.message || 'An error occurred. Please try again later.');
    }
  };

  const handleRemoveFromFavourite = async () => {
    try {
      await deleteFav(`/user/favcomp/${competition.id}`);
      alert(`${competition.name} has been removed from your favourites!`);
      window.location.reload(); // Refresh to update favourite status
    } catch (err) {
      console.error('Error removing from favourites:', err);
      alert(err.message || 'An error occurred. Please try again later.');
    }
  };

  if (error) {
    return <ErrorPage />;
  }

  // Format season dates
  const formatSeasonRange = () => {
    if (!competition.currentSeason) return null;
    const start = new Date(competition.currentSeason.startDate);
    const end = new Date(competition.currentSeason.endDate);
    return `${start.getFullYear()}/${end.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Competition Header */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Main Card */}
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            {/* Top Section - Emblem and Name */}
            <div className="bg-slate-900/50 px-8 py-6 border-b border-slate-700/50">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg flex-shrink-0">
                  <img src={competition.emblem} alt={competition.name} className="w-20 h-20 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white truncate">{competition.name}</h1>
                  {competition.area && (
                    <div className="flex items-center gap-2 mt-2">
                      {competition.area.flag && (
                        <img src={competition.area.flag} alt={competition.area.name} className="w-5 h-4 object-cover rounded-sm" />
                      )}
                      <span className="text-slate-400">{competition.area.name}</span>
                    </div>
                  )}
                </div>
                {/* Favourite Button */}
                <div className="flex-shrink-0">
                  {isFavourite ? (
                    <button
                      onClick={handleRemoveFromFavourite}
                      disabled={mutationLoading}
                      className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from favourites"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToFavourite}
                      disabled={mutationLoading}
                      className="p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to favourites"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-slate-700/50">
              {formatSeasonRange() && (
                <div className="p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Season</p>
                  <p className="text-lg font-semibold text-white">{formatSeasonRange()}</p>
                </div>
              )}
              {competition.currentSeason?.currentMatchday && (
                <div className="p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Matchday</p>
                  <p className="text-lg font-semibold text-white">{competition.currentSeason.currentMatchday}</p>
                </div>
              )}
              {competition.type && (
                <div className="p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Type</p>
                  <p className="text-lg font-semibold text-white capitalize">{competition.type.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation for Group + Knockout competitions */}
          {(competitionFormat === 'group_knockout' || competitionFormat === 'knockout') && (
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                {competitionFormat === 'group_knockout' && (
                  <button
                    onClick={() => setActiveTab('standings')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'standings'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Group Stage
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('knockout')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'knockout'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Knockout
                </button>
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'matches'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Matches
                </button>
              </div>
            </div>
          )}

          {/* League Competition - Standard table + matches */}
          {competitionFormat === 'league' && (
            <>
              <LeagueTable competitionId={id} />
              <h3 className="text-3xl font-bold text-center text-white mt-12 mb-6">
                Matches
              </h3>
              <div className="max-w-2xl mx-auto">
                <MatchList matches={scheduledMatches} />
              </div>
            </>
          )}

          {/* Group + Knockout Competition (UCL, World Cup style) */}
          {competitionFormat === 'group_knockout' && (
            <>
              {activeTab === 'standings' && standings?.standings && (
                <GroupStage standings={standings.standings} isNationalTeam={disableTeamLinks} />
              )}
              {activeTab === 'knockout' && (
                <KnockoutBracket matches={knockoutMatches} isNationalTeam={disableTeamLinks} />
              )}
              {activeTab === 'matches' && (
                <>
                  <h3 className="text-2xl font-bold text-center text-white mb-6">
                    All Matches
                  </h3>
                  <div className="max-w-2xl mx-auto">
                    <MatchList matches={scheduledMatches} isNationalTeam={disableTeamLinks} />
                  </div>
                </>
              )}
            </>
          )}

          {/* Pure Knockout Competition (FA Cup style) */}
          {competitionFormat === 'knockout' && (
            <>
              {activeTab === 'knockout' && (
                <KnockoutBracket matches={knockoutMatches} isNationalTeam={disableTeamLinks} />
              )}
              {activeTab === 'matches' && (
                <>
                  <h3 className="text-2xl font-bold text-center text-white mb-6">
                    All Matches
                  </h3>
                  <div className="max-w-2xl mx-auto">
                    <MatchList matches={scheduledMatches} isNationalTeam={disableTeamLinks} />
                  </div>
                </>
              )}
            </>
          )}

          {/* Group Stage only (no knockout yet) */}
          {competitionFormat === 'group_stage' && standings?.standings && (
            <>
              <GroupStage standings={standings.standings} isNationalTeam={disableTeamLinks} />
              <h3 className="text-2xl font-bold text-center text-white mt-12 mb-6">
                Matches
              </h3>
              <div className="max-w-2xl mx-auto">
                <MatchList matches={leagueMatches} isNationalTeam={disableTeamLinks} />
              </div>
            </>
          )}

          {/* Unknown format - fallback to showing matches */}
          {competitionFormat === 'unknown' && (
            <>
              <LeagueTable competitionId={id} />
              <h3 className="text-3xl font-bold text-center text-white mt-12 mb-6">
                Matches
              </h3>
              <div className="max-w-2xl mx-auto">
                <MatchList matches={scheduledMatches} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;
