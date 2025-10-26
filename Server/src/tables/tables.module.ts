import { Module } from '@nestjs/common';
import { StandingsController } from './tables.controller';
import { StandingsService } from './tables.service';
import { FootballDataModule } from '../football-data/football-data.module';

@Module({
  imports: [FootballDataModule],
  controllers: [StandingsController],
  providers: [StandingsService],
})
export class StandingsModule {}
