import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptors/curent-user.interceptor';
import { TeamsModule } from '../team/teams.module';
import { CompetitionModule } from '../competitions/competition.module';
import { JwtModule } from '@nestjs/jwt';
import { FavouriteService } from './favourite/favourite.service';
import { UserFavComp } from './favourite/user.favcomp.entity';
import { UserFavTeam } from './favourite/user.favteam.entity';
import { HiddenService } from './hidden/hidden.service';
import { UserHiddenComp } from './hidden/user.hiddencomp.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFavComp, UserFavTeam, UserHiddenComp]),
    TeamsModule,
    CompetitionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    FavouriteService,
    HiddenService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  exports: [UsersService, FavouriteService, HiddenService],
})
export class UsersModule {}
