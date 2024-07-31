import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Coach } from './coach.entity';
import { Team } from '../team/team.entity';
import { Competition } from '../competition/competition.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coach, Team, Competition]),
    HttpModule,
  ],
  providers: [CoachService],
  controllers: [CoachController],
  exports: [CoachService, TypeOrmModule]
})
export class CoachModule {}
