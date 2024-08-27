import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const authToken = request.cookies['authToken'];

    if (authToken) {
      try {
        const decodedToken = this.jwtService.verify(authToken);
        const userId = decodedToken.sub; 

        if (userId) {
          const user = await this.usersService.findOne(userId);
          if (user) {
            request.currentUser = user;
          }
        }
      } catch (error) {
        console.error('Failed to verify token:', error);
      }
    }

    return handler.handle();
  }
}
