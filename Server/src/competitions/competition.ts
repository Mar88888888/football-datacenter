import { Team } from '../team/team';
import { User } from '../users/user.entity';
import { CompetitionType } from './competition-type.enum';

export interface Area {
  id: number;
  name: string;
  code?: string;
  flag?: string;
}

export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday?: number;
  winner?: Team;
}

export class Competition {
  id: number;
  name: string;
  code?: string;
  emblem: string;
  area?: Area;
  currentSeason?: Season;
  teams: Team[];
  users: User[];
  type: CompetitionType;
}
