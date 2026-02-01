/**
 * API endpoint paths - centralized for easy maintenance
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH_SIGNIN: '/user/auth/signin',
  AUTH_SIGNUP: '/user/auth/signup',
  AUTH_BY_TOKEN: '/user/auth/bytoken',

  // User favorites
  USER_FAV_TEAMS: '/user/favteam',
  USER_FAV_COMPS: '/user/favcomp',
  USER_FAV_TEAM: (teamId: number | string): string => `/user/favteam/${teamId}`,
  USER_FAV_COMP: (compId: number | string): string => `/user/favcomp/${compId}`,

  // Competitions
  COMPETITIONS: '/competitions',
  COMPETITION: (id: number | string): string => `/competitions/${id}`,
  COMPETITION_MATCHES: (id: number | string): string => `/competitions/${id}/matches`,

  // Standings
  STANDINGS: (competitionId: number | string): string => `/standings/${competitionId}`,

  // Teams
  TEAM: (id: number | string): string => `/teams/${id}`,
  TEAM_MATCHES: (id: number | string): string => `/teams/${id}/matches`,

  // Matches
  MATCHES: '/matches',
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
