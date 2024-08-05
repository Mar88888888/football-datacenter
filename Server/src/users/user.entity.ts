import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { IsEmail, IsString } from 'class-validator';
import { Competition } from '../competition/competition.entity';
import { Team } from '../team/team.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column({nullable: false})
  @IsString()
  name: string;
  
  @Column({nullable: false, unique: true})
  @IsEmail()
  email: string;
  
  @Column({nullable: false})
  @IsString()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @ManyToMany(() => Competition, competition => competition.user)
  @JoinTable()
  favCompetitions: Competition[];

  @ManyToMany(() => Team, team => team.users)
  @JoinTable()
  favTeams: Team[];
}

