import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamService } from './teams.service';
import { Team } from './team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Competition } from '../competition/competition.entity';
import { CompetitionService } from '../competition/competition.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, Competition]),
    HttpModule
  ],
  controllers: [TeamsController],
  providers: [TeamService, CompetitionService],
  exports: [TeamService]
})
export class TeamsModule {}
