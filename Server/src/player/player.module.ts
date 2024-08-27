import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../team/team.entity';
import { TeamService } from '../team/teams.service';
import { Competition } from '../competition/competition.entity';
import { CompetitionService } from '../competition/competition.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, Competition]),
    HttpModule
  ],
  providers: [PlayerService, TeamService, CompetitionService],
  controllers: [PlayerController],
  exports: [PlayerService]
})
export class PlayerModule {}
