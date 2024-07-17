import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Team } from '../team/team.entity';

@Entity()
export class Coach {
  @PrimaryColumn()
  id: number; 
  
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  name: string;

  @Column()
  dateOfBirth: string;

  @Column()
  nationality: string;

  @ManyToOne(() => Team, team => team.coach)
  team: Team;
}
