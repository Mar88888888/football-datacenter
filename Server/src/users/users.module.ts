import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptors/curent-user.interceptor';
import { TeamsModule } from '../team/teams.module';
import { CompetitionModule } from '../competition/competition.module';
import { JwtModule } from '@nestjs/jwt';
import { FavouriteService } from './favourite/favourite.service';
import { UserFavComp } from './favourite/user.favcomp.entity';
import { UserFavTeam } from './favourite/user.favteam.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFavComp, UserFavTeam]),
    TeamsModule,
    CompetitionModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: 'IUsersService',
      useClass: UsersService,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    {
      provide: 'IFavouriteService',
      useClass: FavouriteService,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  exports: ['IUsersService', 'IFavouriteService'],
})
export class UsersModule {}
