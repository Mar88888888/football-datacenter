import { Module } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { CompetitionController } from './competition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Competition } from './competition';

@Module({
  imports: [
    TypeOrmModule.forFeature([Competition]),
    HttpModule,
  ],
  providers: [    {
      provide: 'ICompetitionService',
      useClass: CompetitionService,
    },],
  controllers: [CompetitionController],
  exports: ['ICompetitionService']
})
export class CompetitionModule {}
