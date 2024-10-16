import { Team } from '../team/team.entity';
import { User } from '../users/user.entity';

export class Competition {
  id: number;
  name: string;
  emblem: string;
  team: Team[];
  user: User[];
}
