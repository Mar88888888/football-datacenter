import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.cookies['authToken'];

    if (!authToken) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = this.jwtService.verify(authToken);
      const userId = decodedToken.sub; 

      if (userId) {
        const user = await this.usersService.findOne(userId);
        if (user) {
          request.user = user; 
          return true;
        }
      }

      throw new UnauthorizedException('Invalid token or user');
    } catch (error) {
      throw new UnauthorizedException('Failed to verify token');
    }
  }
}
