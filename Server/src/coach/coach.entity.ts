import { Entity, Column, PrimaryColumn, ManyToOne, OneToOne } from 'typeorm';
import { Team } from '../team/team.entity';

@Entity()
export class Coach {
  @PrimaryColumn()
  id: number; 
  
  @Column({ default: 'unknown'})
  name: string;

  @Column({ default: 'unknown'})
  dateOfBirth: string;

  @Column({ default: 'unknown'})
  nationality: string;

  @OneToOne(() => Team, team => team.coach)
  team: Team;
}
