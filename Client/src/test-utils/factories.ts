import type { Match, Score, MatchStatus } from '../types/match.types';
import type { Team, TeamMinimal } from '../types/team.types';
import type { Competition, Area, Season } from '../types/competition.types';
import type { User } from '../types/auth.types';
import type { FavoriteTeam, FavoriteCompetition } from '../types/favorites.types';

// ==================== TEAM FACTORIES ====================

export const createTeamMinimal = (overrides?: Partial<TeamMinimal>): TeamMinimal => ({
  id: 64,
  name: 'Liverpool FC',
  shortName: 'Liverpool',
  crest: 'https://crests.football-data.org/64.png',
  ...overrides,
});

export const createTeam = (overrides?: Partial<Team>): Team => ({
  id: 64,
  name: 'Liverpool FC',
  shortName: 'Liverpool',
  tla: 'LIV',
  crest: 'https://crests.football-data.org/64.png',
  address: 'Anfield Road Liverpool L4 0TH',
  website: 'http://www.liverpoolfc.tv',
  founded: 1892,
  clubColors: 'Red / White',
  venue: 'Anfield',
  coach: { id: 1, name: 'Arne Slot' },
  runningCompetitions: [
    { id: 2021, name: 'Premier League', code: 'PL', emblem: 'https://crests.football-data.org/PL.png', area: { id: 2072, name: 'England' }, currentSeason: { id: 1, startDate: '2024-08-01', endDate: '2025-05-31' }, type: 'LEAGUE' },
  ],
  ...overrides,
});

// ==================== COMPETITION FACTORIES ====================

export const createArea = (overrides?: Partial<Area>): Area => ({
  id: 2072,
  name: 'England',
  code: 'ENG',
  flag: 'https://crests.football-data.org/770.svg',
  ...overrides,
});

export const createSeason = (overrides?: Partial<Season>): Season => ({
  id: 1,
  startDate: '2024-08-01',
  endDate: '2025-05-31',
  currentMatchday: 21,
  ...overrides,
});

export const createCompetition = (overrides?: Partial<Competition>): Competition => ({
  id: 2021,
  name: 'Premier League',
  code: 'PL',
  emblem: 'https://crests.football-data.org/PL.png',
  area: createArea(),
  currentSeason: createSeason(),
  type: 'LEAGUE',
  ...overrides,
});

// ==================== MATCH FACTORIES ====================

export const createScore = (overrides?: Partial<Score>): Score => ({
  fullTime: { home: null, away: null },
  ...overrides,
});

export const createMatch = (overrides?: Partial<Match>): Match => ({
  id: 1,
  utcDate: new Date().toISOString(),
  status: 'SCHEDULED' as MatchStatus,
  matchday: 21,
  score: createScore(),
  homeTeam: createTeamMinimal({ id: 64, name: 'Liverpool FC' }),
  awayTeam: createTeamMinimal({ id: 65, name: 'Manchester City', shortName: 'Man City' }),
  competition: createCompetition(),
  ...overrides,
});

export const createScheduledMatch = (overrides?: Partial<Match>): Match =>
  createMatch({ status: 'SCHEDULED', score: createScore(), ...overrides });

export const createInPlayMatch = (overrides?: Partial<Match>): Match =>
  createMatch({
    status: 'IN_PLAY',
    score: createScore({ fullTime: { home: 1, away: 0 } }),
    ...overrides,
  });

export const createFinishedMatch = (overrides?: Partial<Match>): Match =>
  createMatch({
    status: 'FINISHED',
    score: createScore({ fullTime: { home: 2, away: 1 }, winner: 'HOME_TEAM' }),
    ...overrides,
  });

// ==================== USER FACTORIES ====================

export const createUser = (overrides?: Partial<User>): User => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

// ==================== FAVORITE FACTORIES ====================

export const createFavoriteTeam = (overrides?: Partial<FavoriteTeam>): FavoriteTeam => ({
  id: 64,
  name: 'Liverpool FC',
  crest: 'https://crests.football-data.org/64.png',
  ...overrides,
});

export const createFavoriteCompetition = (overrides?: Partial<FavoriteCompetition>): FavoriteCompetition => ({
  id: 2021,
  name: 'Premier League',
  emblem: 'https://crests.football-data.org/PL.png',
  ...overrides,
});

// ==================== BATCH FACTORIES ====================

export const createMatches = (count: number, overrides?: Partial<Match>): Match[] =>
  Array.from({ length: count }, (_, i) =>
    createMatch({
      id: i + 1,
      utcDate: new Date(Date.now() + i * 86400000).toISOString(), // Each day
      ...overrides,
    })
  );

export const createFavoriteTeams = (count: number): FavoriteTeam[] =>
  Array.from({ length: count }, (_, i) =>
    createFavoriteTeam({
      id: 64 + i,
      name: `Team ${i + 1}`,
    })
  );

export const createFavoriteCompetitions = (count: number): FavoriteCompetition[] =>
  Array.from({ length: count }, (_, i) =>
    createFavoriteCompetition({
      id: 2021 + i,
      name: `Competition ${i + 1}`,
    })
  );
