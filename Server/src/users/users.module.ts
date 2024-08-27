import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptors/curent-user.interceptor';
import { MailModule } from '../mail/mail.module';
import { TeamsModule } from '../team/teams.module';
import { CompetitionModule } from '../competition/competition.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule, TeamsModule, CompetitionModule,
    JwtModule.register({
        secret: 'your_jwt_secret', // Replace with your secret
        signOptions: { expiresIn: '1h' }, // Set token expiration
      }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
