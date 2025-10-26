import { Competition } from '../competition/competition';
import { User } from '../users/user.entity';

export class Team {
  id: number;
  name: string;
  shortName: string;
  crest: string;
  address: string;
  founded: number;
  competitions: Competition[];
  users: User[];
}
