import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  dateOfBirth: string;

  @Column()
  nationality: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  shirtNumber: number;

  @Column()
  currentTeamId: number;
}
