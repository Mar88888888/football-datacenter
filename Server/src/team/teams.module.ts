import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamService } from './teams.service';
import { HttpModule } from '@nestjs/axios';
import { FootballDataModule } from '../football-data/football-data.module';

@Module({
  imports: [HttpModule, FootballDataModule],
  controllers: [TeamsController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamsModule {}
