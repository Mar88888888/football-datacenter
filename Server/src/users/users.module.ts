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
import { FavouriteService } from './favourite/favourite.service';
import { UserFavComp } from './favourite/user.favcomp.entity';
import { UserFavTeam } from './favourite/user.favteam.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserFavComp, UserFavTeam]), 
    MailModule, TeamsModule, CompetitionModule,
    JwtModule.register({
        secret: 'your_jwt_secret',
        signOptions: { expiresIn: '1h' },
      }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    FavouriteService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  exports: [UsersService, FavouriteService],
})
export class UsersModule {}
