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
  USER_FAV_TEAM: (teamId) => `/user/favteam/${teamId}`,
  USER_FAV_COMP: (compId) => `/user/favcomp/${compId}`,

  // Competitions
  COMPETITIONS: '/competitions',
  COMPETITION: (id) => `/competitions/${id}`,
  COMPETITION_MATCHES: (id) => `/competitions/${id}/matches`,

  // Standings
  STANDINGS: (competitionId) => `/standings/${competitionId}`,

  // Teams
  TEAM: (id) => `/teams/${id}`,
  TEAM_MATCHES: (id) => `/teams/${id}/matches`,

  // Matches
  MATCHES: '/matches',
};
