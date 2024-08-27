import { CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export class EmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;

    if (!currentUser) {
      throw new UnauthorizedException('User not authenticated');
    }

    return currentUser.isEmailVerified;
  }
}
