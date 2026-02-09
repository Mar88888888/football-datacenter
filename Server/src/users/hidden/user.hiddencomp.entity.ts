import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class UserHiddenComp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.hiddenCompetitions, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  competitionId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  emblem: string;
}
