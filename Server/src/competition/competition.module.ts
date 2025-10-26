import { Module } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { CompetitionController } from './competition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Competition } from './competition';
import { FootballDataModule } from '../football-data/football-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Competition]),
    HttpModule,
    FootballDataModule,
  ],
  providers: [CompetitionService],
  controllers: [CompetitionController],
  exports: [CompetitionService],
})
export class CompetitionModule {}
