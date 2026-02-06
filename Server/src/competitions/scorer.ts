import { Team } from '../team/team';

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
  team: Team;
  playedMatches: number;
  goals: number;
  assists?: number;
  penalties?: number;
}
