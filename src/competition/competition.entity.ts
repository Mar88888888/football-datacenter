import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Team } from '../team/team.entity';

@Entity()
export class Competition {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Team, team => team.competitions)
  team: Team;
}
