import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUsersService } from '../users/users.service.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUsersService') private readonly usersService: IUsersService,
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
