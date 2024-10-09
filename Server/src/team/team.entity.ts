import { Entity, Column, OneToOne, JoinTable, ManyToMany, JoinColumn, PrimaryColumn } from 'typeorm';
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
  crest: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  gender: 'male' | 'female';

  @Column({ nullable: true })
  founded: string;

  @Column({ nullable: true })
  clubColors: string;
  
  
  @Column({ nullable: true })
  coachName: string;
  
  @ManyToMany(() => Competition, competition => competition.team,  {cascade: true})
  @JoinTable()
  competitions: Competition[];

  @ManyToMany(() => User, user => user.favTeams)
  users: User[];
}
