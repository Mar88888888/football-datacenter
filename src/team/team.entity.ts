import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { Coach } from '../coach/coach.entity';
import { Player } from '../player/player.entity';
import { Competition } from '../competition/competition.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortName: string;

  @Column()
  tla: string;

  @Column()
  crest: string;

  @Column()
  address: string;

  @Column()
  website: string;

  @Column()
  founded: number;

  @Column()
  clubColors: string;

  @Column()
  venue: string;

  @OneToOne(() => Coach, { cascade: true })
  coach: Coach;

  @OneToMany(() => Player, player => player.currentTeamId, { cascade: true })
  squad: Player[];

  @OneToMany(() => Competition, competition => competition.team)
  competitions: Competition[];
}
