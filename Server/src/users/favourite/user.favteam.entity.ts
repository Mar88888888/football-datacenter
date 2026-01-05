import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class UserFavTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favTeams, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  teamId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  crest: string;
}
