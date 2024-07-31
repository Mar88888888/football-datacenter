import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamService } from './teams.service';
import { Team } from './team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Competition } from '../competition/competition.entity';
import { CompetitionService } from '../competition/competition.service';
import { GlobalRequestCounterService } from '../global-request-counter.service';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, Competition]),
    HttpModule,
    CoachModule
  ],
  controllers: [TeamsController],
  providers: [TeamService, CompetitionService, GlobalRequestCounterService],
  exports: [TeamService]
})
export class TeamsModule {}
