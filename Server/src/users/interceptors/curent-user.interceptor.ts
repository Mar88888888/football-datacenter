import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session || {};
    console.log('Session:', request.session);
    if (userId) {
      const user = await this.usersService.findOne(userId);
      console.log(`User:`, user);
      request.currentUser = user;
      request.session.emailVerified = user.isEmailVerified;
    }

    return handler.handle();
  }
}
