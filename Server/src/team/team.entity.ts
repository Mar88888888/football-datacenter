import { Entity, Column, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Competition } from '../competition/competition.entity';
import { User } from '../users/user.entity';

export class Team {
  id: number;

  name: string;

  shortName: string;

  crest: string;

  address: string;

  gender: 'male' | 'female';

  founded: string;

  clubColors: string;
  
  coachName: string;
  
  competitions: Competition[];
  
  users: User[];
}
