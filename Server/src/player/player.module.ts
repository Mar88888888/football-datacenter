import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../team/team';
import { TeamService } from '../team/teams.service';
import { Competition } from '../competition/competition';
import { CompetitionService } from '../competition/competition.service';
import { TeamsModule } from '../team/teams.module';
import { CompetitionModule } from '../competition/competition.module';

@Module({
  imports: [
    HttpModule, 
  ],
  providers: [    
    {
      provide: 'IPlayerService',
      useClass: PlayerService,
    }],
  controllers: [PlayerController],
  exports: ['IPlayerService']
})
export class PlayerModule {}
