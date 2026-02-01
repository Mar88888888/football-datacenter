import { User } from './user.entity';

export interface IUsersService {
  create(email: string, password: string, name: string): Promise<User>;
  findOne(id: number): Promise<User | null>;
  find(email: string): Promise<User[]>;
  findAll(): Promise<User[]>;
  update(id: number, attrs: Partial<User>): Promise<User>;
  remove(id: number): Promise<User>;
}
