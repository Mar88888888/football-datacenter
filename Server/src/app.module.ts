import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UserFavComp } from './users/favourite/user.favcomp.entity';
import { UserFavTeam } from './users/favourite/user.favteam.entity';
import { MatchesModule } from './matches/matches.module';
import { HttpModule } from '@nestjs/axios';
import { TeamsModule } from './team/teams.module';
import { CompetitionModule } from './competitions/competition.module';
import { StandingsModule } from './standings/standings.module';
import { FootballDataModule } from './football-data/football-data.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { UserHiddenComp } from './users/hidden/user.hiddencomp.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, UserFavComp, UserFavTeam, UserHiddenComp],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [User, UserFavComp, UserFavTeam, UserHiddenComp],
          synchronize: true,
        };
      },
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (redisUrl) {
          return {
            store: await redisStore({
              url: redisUrl,
            }),
            ttl: 60 * 1000,
          };
        }

        return {
          store: await redisStore({
            socket: {
              host: configService.get<string>('REDIS_HOST') || 'localhost',
              port: configService.get<number>('REDIS_PORT') || 6379,
            },
          }),
          ttl: 60 * 1000,
        };
      },
    }),

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute (general)
      },
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 5, // 5 auth attempts per minute
      },
    ]),

    UsersModule,
    MatchesModule,
    HttpModule,
    TeamsModule,
    CompetitionModule,
    StandingsModule,
    FootballDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
