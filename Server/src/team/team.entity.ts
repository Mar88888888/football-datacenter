import { Entity, Column, OneToOne, JoinTable, ManyToMany, JoinColumn, PrimaryColumn } from 'typeorm';
import { Coach } from '../coach/coach.entity';
import { Competition } from '../competition/competition.entity';
import { User } from '../users/user.entity';

@Entity()
export class Team {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  tla: string;

  @Column({ nullable: true })
  crest: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  founded: number;

  @Column({ nullable: true })
  clubColors: string;

  @Column({ nullable: true })
  venue: string;

  @OneToOne(() => Coach, coach => coach.team, { cascade: true })
  @JoinColumn()
  coach: Coach;
  
  @ManyToMany(() => Competition, competition => competition.team,  {cascade: true})
  @JoinTable()
  competitions: Competition[];

  @ManyToMany(() => User, user => user.favTeams)
  users: User[];
}
