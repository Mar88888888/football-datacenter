import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsEmail, IsString } from 'class-validator';
import { UserFavComp } from './favourite/user.favcomp.entity';
import { UserFavTeam } from './favourite/user.favteam.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @IsString()
  name: string;

  @Column({ nullable: false, unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: false })
  @IsString()
  password: string;

  @OneToMany(() => UserFavComp, favCompetition => favCompetition.user)
  favCompetitions: UserFavComp[];

  @OneToMany(() => UserFavTeam, favTeam => favTeam.user)
  favTeams: UserFavTeam[];
}
