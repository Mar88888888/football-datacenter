import { Competition } from '../competitions/competition';
import { User } from '../users/user.entity';

export interface Coach {
  id: number;
  name: string;
  nationality?: string;
}

export class Team {
  id: number;
  name: string;
  shortName: string;
  tla?: string;
  crest: string;
  address: string;
  website?: string;
  founded: number;
  clubColors?: string;
  venue?: string;
  coach?: Coach;
  competitions: Competition[];
  runningCompetitions?: Competition[];
  users: User[];
}
