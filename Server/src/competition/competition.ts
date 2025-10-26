import { Team } from '../team/team';
import { User } from '../users/user.entity';
import { CompetitionType } from './competition-type.enum';

export class Competition {
  id: number;
  name: string;
  emblem: string;
  teams: Team[];
  users: User[];
  type: CompetitionType;
}
