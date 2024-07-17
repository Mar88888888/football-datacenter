import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { MatchesModule } from './matches/matches.module';
import { HttpModule } from '@nestjs/axios';
import { TeamsModule } from './team/teams.module';
import { PlayerModule } from './player/player.module';
import { CompetitionModule } from './competition/competition.module';
import { CoachModule } from './coach/coach.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { Team } from './team/team.entity';
import { Competition } from './competition/competition.entity';
import { Coach } from './coach/coach.entity';
import { Player } from './player/player.entity';
import { GlobalRequestCounterService } from './global-request-counter.service';

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
    TypeOrmModule.forFeature([User, Team, Competition, Coach, Player]),
    UsersModule,
    MatchesModule, 
    HttpModule, TeamsModule, PlayerModule, CompetitionModule, CoachModule, SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService, GlobalRequestCounterService],
})
export class AppModule {}
