import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Coach } from './coach.entity';
import { TeamsModule } from '../team/teams.module';
import { TeamService } from '../team/teams.service';
import { Team } from '../team/team.entity';
import { Competition } from '../competition/competition.entity';
import { CompetitionService } from '../competition/competition.service';
import { GlobalRequestCounterService } from '../global-request-counter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coach, Team, Competition]),
    HttpModule,
    TeamsModule,
  ],
  providers: [CoachService, TeamService,CompetitionService, GlobalRequestCounterService],
  controllers: [CoachController],
  exports: [CoachService]
})
export class CoachModule {}
