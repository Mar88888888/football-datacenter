import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../users/users.module';
import { FootballDataModule } from '../football-data/football-data.module';

@Module({
  imports: [HttpModule, UsersModule, FootballDataModule],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
