import { Module } from '@nestjs/common';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { FootballDataModule } from '../football-data/football-data.module';

@Module({
  imports: [FootballDataModule],
  controllers: [StandingsController],
  providers: [StandingsService],
})
export class StandingsModule {}
