import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../team/team.entity';
import { TeamService } from '../team/teams.service';
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
  providers: [PlayerService, TeamService, CompetitionService, GlobalRequestCounterService],
  controllers: [PlayerController],
  exports: [PlayerService]
})
export class PlayerModule {}
