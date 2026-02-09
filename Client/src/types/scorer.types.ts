import type { TeamMinimal } from './team.types';

export interface Player {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  section?: string;
  position?: string;
  shirtNumber?: number;
}

export interface Scorer {
  player: Player;
  team: TeamMinimal;
  playedMatches: number;
  goals: number;
  assists?: number;
  penalties?: number;
}
