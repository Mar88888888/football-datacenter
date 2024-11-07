import { User } from './user.entity';

export interface IAuthService {
  signup(email: string, password: string, name: string): Promise<{ user: User; accessToken: string }>;
  signin(email: string, password: string): Promise<{ accessToken: string; user: User }>;
  verifyEmail(token: string): Promise<{ message: string }>;
  generateJwtToken(payload: { sub: number; email: string }): string;
  getUserFromToken(token: string): Promise<User>;
}
