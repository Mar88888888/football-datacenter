import { useMemo } from 'react';
import type { Match, Competition, Standings, CompetitionFormat } from '../types';

const KNOCKOUT_STAGES: string[] = [
  'ROUND_1',
  'ROUND_2',
  'ROUND_3',
  'PLAYOFFS',
  'LAST_64',
  'LAST_32',
  'LAST_16',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
];

const DISABLED_COMPETITION_CODES: string[] = ['WC', 'EC', 'CAF', 'AFC', 'CONMEBOL', 'CONCACAF', 'CLI'];
const DISABLED_NAME_PATTERNS: string[] = [
  'World Cup',
  'European Championship',
  'Euro 20',
  'Copa America',
  'Africa Cup',
  'Asian Cup',
  'Libertadores',
];

interface UseCompetitionFormatResult {
  format: CompetitionFormat;
  knockoutMatches: Match[];
  leagueMatches: Match[];
  disableTeamLinks: boolean;
}

/**
 * Hook to determine competition format and filter matches by type
 */
const useCompetitionFormat = (
  standings: Standings | null,
  matches: Match[] = [],
  competition: Competition | null
): UseCompetitionFormatResult => {
  const disableTeamLinks = useMemo(() => {
    if (!competition) return false;

    const isDisabledByCode = DISABLED_COMPETITION_CODES.includes(competition.code);
    const isDisabledByName = DISABLED_NAME_PATTERNS.some((pattern) =>
      competition.name?.includes(pattern)
    );

    return isDisabledByCode || isDisabledByName;
  }, [competition]);

  const format = useMemo((): CompetitionFormat => {
    if (!standings?.standings) return 'unknown';

    const hasLeaguePhase = standings.standings.some(
      (s) => s.group === 'League phase' || s.group === 'League Phase'
    );

    const hasTraditionalGroups = standings.standings.some(
      (s) => s.group && (s.group.startsWith('Group ') || s.group.startsWith('GROUP_'))
    );

    const hasLeagueTable = standings.standings.some(
      (s) => s.stage === 'REGULAR_SEASON' && s.type === 'TOTAL'
    );

    const hasKnockout = matches.some(
      (m) => m.stage && KNOCKOUT_STAGES.includes(m.stage)
    );

    if (hasTraditionalGroups && hasKnockout) return 'group_knockout';
    if (hasTraditionalGroups) return 'group_stage';
    if (hasLeaguePhase && hasKnockout) return 'group_knockout';
    if (hasLeaguePhase) return 'group_stage';
    if (hasKnockout && !hasLeagueTable) return 'knockout';
    if (hasLeagueTable) return 'league';

    return 'unknown';
  }, [standings, matches]);

  const knockoutMatches = useMemo(() => {
    return matches.filter((m) => m.stage && KNOCKOUT_STAGES.includes(m.stage));
  }, [matches]);

  const leagueMatches = useMemo(() => {
    return matches.filter(
      (m) => !m.stage || m.stage === 'REGULAR_SEASON' || m.stage === 'GROUP_STAGE' || m.stage === 'LEAGUE_STAGE'
    );
  }, [matches]);

  return {
    format,
    knockoutMatches,
    leagueMatches,
    disableTeamLinks,
  };
};

export default useCompetitionFormat;
