import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';
import { Team } from '../team/team.entity';
import { User } from '../users/user.entity';

@Entity()
export class Competition {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
  
  @Column({ nullable: true })
  emblem: string;

  @ManyToMany(() => Team, team => team.competitions)
  team: Team[];

  @ManyToMany(() => User, user => user.favCompetitions, {cascade: true})
  user: User[];
}
