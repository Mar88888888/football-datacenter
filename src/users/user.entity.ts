import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsString } from 'class-validator';

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
}

