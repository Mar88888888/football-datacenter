import { Match } from './match';

export interface MatchesResponse {
  filters: MatchFilters;
  matches: Match[];
}

export interface MatchFilters {
  competitions?: string[];
  limit?: number;
  season?: number;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  ids?: number[];
  offset?: number;
}
