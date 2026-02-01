import type { Competition } from './competition.types';

export interface Coach {
  id: number;
  name: string;
  nationality?: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  coach?: Coach;
  competitions?: Competition[];
  runningCompetitions: Competition[];
}

export interface TeamMinimal {
  id: number;
  name: string;
  shortName?: string;
  crest: string;
}
