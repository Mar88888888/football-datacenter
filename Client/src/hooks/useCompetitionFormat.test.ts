import { renderHook } from '@testing-library/react';
import useCompetitionFormat from './useCompetitionFormat';
import type { Competition, Match, Standings, StandingGroup } from '../types';

// Helper to create partial standings for tests
const createStandings = (standings: Partial<StandingGroup>[] | undefined): Standings | null => {
  if (!standings) return null;
  return { standings: standings as StandingGroup[] } as Standings;
};

// Helper to create partial matches for tests
const createMatches = (matches: Partial<Match>[]): Match[] => matches as Match[];

// Helper to create partial competition for tests
const createCompetition = (comp: Partial<Competition> | null): Competition | null => comp as Competition | null;

describe('useCompetitionFormat', () => {
  describe('format detection', () => {
    it('returns "unknown" when standings is null', () => {
      const { result } = renderHook(() => useCompetitionFormat(null, [], null));
      expect(result.current.format).toBe('unknown');
    });

    it('returns "unknown" when standings.standings is undefined', () => {
      const { result } = renderHook(() => useCompetitionFormat({} as Standings, [], null));
      expect(result.current.format).toBe('unknown');
    });

    it('returns "league" for regular season competition', () => {
      const standings = createStandings([{ stage: 'REGULAR_SEASON', type: 'TOTAL' }]);
      const { result } = renderHook(() => useCompetitionFormat(standings, [], null));
      expect(result.current.format).toBe('league');
    });

    it('returns "knockout" for pure knockout competition', () => {
      const standings = createStandings([]);
      const matches = createMatches([
        { stage: 'QUARTER_FINALS' },
        { stage: 'SEMI_FINALS' },
        { stage: 'FINAL' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(standings, matches, null));
      expect(result.current.format).toBe('knockout');
    });

    it('returns "group_stage" for competition with traditional groups', () => {
      const standings = createStandings([
        { group: 'Group A' },
        { group: 'Group B' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(standings, [], null));
      expect(result.current.format).toBe('group_stage');
    });

    it('returns "group_knockout" for competition with groups and knockout', () => {
      const standings = createStandings([
        { group: 'Group A' },
        { group: 'Group B' },
      ]);
      const matches = createMatches([
        { stage: 'GROUP_STAGE' },
        { stage: 'ROUND_OF_16' },
        { stage: 'FINAL' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(standings, matches, null));
      expect(result.current.format).toBe('group_knockout');
    });

    it('returns "group_knockout" for UCL league phase format', () => {
      const standings = createStandings([{ group: 'League phase' }]);
      const matches = createMatches([
        { stage: 'LAST_16' },
        { stage: 'FINAL' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(standings, matches, null));
      expect(result.current.format).toBe('group_knockout');
    });

    it('handles GROUP_ prefix format', () => {
      const standings = createStandings([
        { group: 'GROUP_A' },
        { group: 'GROUP_B' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(standings, [], null));
      expect(result.current.format).toBe('group_stage');
    });
  });

  describe('knockoutMatches filtering', () => {
    it('returns empty array when no knockout matches', () => {
      const matches = createMatches([
        { stage: 'REGULAR_SEASON' },
        { stage: 'GROUP_STAGE' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(null, matches, null));
      expect(result.current.knockoutMatches).toEqual([]);
    });

    it('filters only knockout stage matches', () => {
      const matches = createMatches([
        { id: 1, stage: 'GROUP_STAGE' },
        { id: 2, stage: 'ROUND_OF_16' },
        { id: 3, stage: 'QUARTER_FINALS' },
        { id: 4, stage: 'SEMI_FINALS' },
        { id: 5, stage: 'FINAL' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(null, matches, null));

      expect(result.current.knockoutMatches).toHaveLength(4);
      expect(result.current.knockoutMatches.map(m => m.id)).toEqual([2, 3, 4, 5]);
    });

    it('includes all knockout stages', () => {
      const allKnockoutStages = [
        'ROUND_1', 'ROUND_2', 'ROUND_3', 'LAST_64', 'LAST_32',
        'LAST_16', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS',
        'THIRD_PLACE', 'FINAL'
      ];
      const matches = createMatches(allKnockoutStages.map((stage, id) => ({ id, stage })));

      const { result } = renderHook(() => useCompetitionFormat(null, matches, null));

      expect(result.current.knockoutMatches).toHaveLength(allKnockoutStages.length);
    });
  });

  describe('leagueMatches filtering', () => {
    it('returns matches without stage', () => {
      const matches = createMatches([
        { id: 1, stage: undefined },
        { id: 2 }, // no stage property
        { id: 3, stage: 'FINAL' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(null, matches, null));

      expect(result.current.leagueMatches.map(m => m.id)).toEqual([1, 2]);
    });

    it('returns REGULAR_SEASON matches', () => {
      const matches = createMatches([
        { id: 1, stage: 'REGULAR_SEASON' },
        { id: 2, stage: 'QUARTER_FINALS' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(null, matches, null));

      expect(result.current.leagueMatches.map(m => m.id)).toEqual([1]);
    });

    it('returns GROUP_STAGE matches', () => {
      const matches = createMatches([
        { id: 1, stage: 'GROUP_STAGE' },
        { id: 2, stage: 'FINAL' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(null, matches, null));

      expect(result.current.leagueMatches.map(m => m.id)).toEqual([1]);
    });

    it('returns LEAGUE_STAGE matches (UCL new format)', () => {
      const matches = createMatches([
        { id: 1, stage: 'LEAGUE_STAGE' },
        { id: 2, stage: 'ROUND_OF_16' },
        { id: 3, stage: 'FINAL' },
      ]);
      const { result } = renderHook(() => useCompetitionFormat(null, matches, null));

      expect(result.current.leagueMatches.map(m => m.id)).toEqual([1]);
    });
  });

  describe('disableTeamLinks', () => {
    it('returns false when competition is null', () => {
      const { result } = renderHook(() => useCompetitionFormat(null, [], null));
      expect(result.current.disableTeamLinks).toBe(false);
    });

    it('returns true for World Cup (code WC)', () => {
      const competition = createCompetition({ code: 'WC', name: 'FIFA World Cup' });
      const { result } = renderHook(() => useCompetitionFormat(null, [], competition));
      expect(result.current.disableTeamLinks).toBe(true);
    });

    it('returns true for European Championship (code EC)', () => {
      const competition = createCompetition({ code: 'EC', name: 'UEFA European Championship' });
      const { result } = renderHook(() => useCompetitionFormat(null, [], competition));
      expect(result.current.disableTeamLinks).toBe(true);
    });

    it('returns true for Copa Libertadores (code CLI)', () => {
      const competition = createCompetition({ code: 'CLI', name: 'Copa Libertadores' });
      const { result } = renderHook(() => useCompetitionFormat(null, [], competition));
      expect(result.current.disableTeamLinks).toBe(true);
    });

    it('returns true for competition with "World Cup" in name', () => {
      const competition = createCompetition({ code: 'OTHER', name: 'FIFA World Cup 2022' });
      const { result } = renderHook(() => useCompetitionFormat(null, [], competition));
      expect(result.current.disableTeamLinks).toBe(true);
    });

    it('returns true for competition with "European Championship" in name', () => {
      const competition = createCompetition({ code: 'OTHER', name: 'UEFA European Championship 2024' });
      const { result } = renderHook(() => useCompetitionFormat(null, [], competition));
      expect(result.current.disableTeamLinks).toBe(true);
    });

    it('returns false for Premier League', () => {
      const competition = createCompetition({ code: 'PL', name: 'Premier League' });
      const { result } = renderHook(() => useCompetitionFormat(null, [], competition));
      expect(result.current.disableTeamLinks).toBe(false);
    });

    it('returns false for Champions League', () => {
      const competition = createCompetition({ code: 'CL', name: 'UEFA Champions League' });
      const { result } = renderHook(() => useCompetitionFormat(null, [], competition));
      expect(result.current.disableTeamLinks).toBe(false);
    });
  });
});
