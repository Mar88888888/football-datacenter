import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { MatchesModule } from './matches/matches.module';
import { HttpModule } from '@nestjs/axios';
import { TeamsModule } from './team/teams.module';
import { CompetitionModule } from './competition/competition.module';
import { Team } from './team/team';
import { Competition } from './competition/competition';
import { StandingsModule } from './standings/standings.module';
import { FootballDataModule } from './football-data/football-data.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'football-datacenter',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Team, Competition]),
    ConfigModule.forRoot({
      isGlobal: true,
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
