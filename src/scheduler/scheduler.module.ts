import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { SchedulerService } from './scheduler.service';
import { TeamsModule } from '../team/teams.module';
import { CompetitionModule } from '../competition/competition.module';
import { PlayerModule } from '../player/player.module';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [ScheduleModule.forRoot(), HttpModule, CompetitionModule, TeamsModule, PlayerModule, CoachModule],
  providers: [
    SchedulerService,
  ],
})
export class SchedulerModule {}
