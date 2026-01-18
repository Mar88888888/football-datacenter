import { Module } from '@nestjs/common';
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
import { BullModule } from '@nestjs/bullmq';
import { redisStore } from 'cache-manager-redis-yet';

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
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, UserFavComp, UserFavTeam],
        synchronize: true,
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST') || 'localhost',
            port: configService.get<number>('REDIS_PORT') || 6379,
          },
        }),
        ttl: 60 * 1000, // cache-manager v5 uses milliseconds
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),

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
