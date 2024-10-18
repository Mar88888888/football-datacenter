import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamService } from './teams.service';
import { HttpModule } from '@nestjs/axios';
import { CompetitionService } from '../competition/competition.service';

@Module({
  imports: [
    HttpModule
  ],
  controllers: [TeamsController],
  providers: [TeamService, CompetitionService],
  exports: [TeamService]
})
export class TeamsModule {}
