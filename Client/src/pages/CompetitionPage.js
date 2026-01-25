import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import useCompetitionFormat from '../hooks/useCompetitionFormat';
import useFavourite from '../hooks/useFavourite';
import CompetitionHeader from '../components/CompetitionHeader';
import CompetitionTabs from '../components/CompetitionTabs';
import LeagueTable from '../components/LeagueTable';
import GroupStage from '../components/GroupStage';
import KnockoutBracket from '../components/KnockoutBracket';
import MatchList from '../components/MatchList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';

const CompetitionPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('standings');

  // Fetch competition data
  const {
    data: competition,
    loading: loadingCompetition,
    error: competitionError,
  } = useApi(API_ENDPOINTS.COMPETITION(id));

  // Fetch standings
  const { data: standings } = useApi(API_ENDPOINTS.STANDINGS(id));

  // Fetch matches
  const { data: matchesData, error: matchesError } = useApi(API_ENDPOINTS.COMPETITION_MATCHES(id));
  const matches = matchesData || [];

  // Competition format detection
  const { format, knockoutMatches, leagueMatches, disableTeamLinks } = useCompetitionFormat(
    standings,
    matches,
    competition
  );

  // Favourite management
  const { isFavourite, loading: favouriteLoading, toggleFavourite } = useFavourite(
    'competition',
    id,
    competition?.name
  );

  const error = competitionError || matchesError;

  // Reset tab when competition changes
  useEffect(() => {
    setActiveTab('standings');
  }, [id]);

  // Set initial tab based on competition format
  useEffect(() => {
    if (format === 'knockout') {
      setActiveTab('knockout');
    } else if (format === 'group_knockout' || format === 'group_stage') {
      setActiveTab('standings');
    }
  }, [format]);

  if (loadingCompetition || !competition) {
    return <LoadingSpinner message="Loading competition data..." />;
  }

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <CompetitionHeader
        competition={competition}
        isFavourite={isFavourite}
        onToggleFavourite={toggleFavourite}
        loading={favouriteLoading}
      />

      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <CompetitionTabs format={format} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* League Competition */}
          {format === 'league' && (
            <>
              <LeagueTable competitionId={id} />
              <h3 className="text-3xl font-bold text-center text-white mt-12 mb-6">Matches</h3>
              <div className="max-w-2xl mx-auto">
                <MatchList matches={matches} />
              </div>
            </>
          )}

          {/* Group + Knockout Competition */}
          {format === 'group_knockout' && (
            <>
              {activeTab === 'standings' && standings?.standings && (
                <GroupStage standings={standings.standings} isNationalTeam={disableTeamLinks} />
              )}
              {activeTab === 'knockout' && (
                <KnockoutBracket matches={knockoutMatches} isNationalTeam={disableTeamLinks} />
              )}
              {activeTab === 'matches' && (
                <>
                  <h3 className="text-2xl font-bold text-center text-white mb-6">All Matches</h3>
                  <div className="max-w-2xl mx-auto">
                    <MatchList matches={matches} isNationalTeam={disableTeamLinks} />
                  </div>
                </>
              )}
            </>
          )}

          {/* Pure Knockout Competition */}
          {format === 'knockout' && (
            <>
              {activeTab === 'knockout' && (
                <KnockoutBracket matches={knockoutMatches} isNationalTeam={disableTeamLinks} />
              )}
              {activeTab === 'matches' && (
                <>
                  <h3 className="text-2xl font-bold text-center text-white mb-6">All Matches</h3>
                  <div className="max-w-2xl mx-auto">
                    <MatchList matches={matches} isNationalTeam={disableTeamLinks} />
                  </div>
                </>
              )}
            </>
          )}

          {/* Group Stage only */}
          {format === 'group_stage' && standings?.standings && (
            <>
              <GroupStage standings={standings.standings} isNationalTeam={disableTeamLinks} />
              <h3 className="text-2xl font-bold text-center text-white mt-12 mb-6">Matches</h3>
              <div className="max-w-2xl mx-auto">
                <MatchList matches={leagueMatches} isNationalTeam={disableTeamLinks} />
              </div>
            </>
          )}

          {/* Unknown format - fallback */}
          {format === 'unknown' && (
            <>
              <LeagueTable competitionId={id} />
              <h3 className="text-3xl font-bold text-center text-white mt-12 mb-6">Matches</h3>
              <div className="max-w-2xl mx-auto">
                <MatchList matches={matches} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;
