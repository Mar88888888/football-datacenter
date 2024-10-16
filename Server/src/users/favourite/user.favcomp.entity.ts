import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class UserFavComp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.favCompetitions, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  competitionId: number;
}
