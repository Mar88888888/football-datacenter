import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { FootballDataProcessor } from './football-data.processor';
import { FootballDataService } from './football-data.service';
import { SyncService } from './sync.service';
import { FOOTBALL_DATA_QUEUE } from './football-data.types';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get('DATA_API'),
        headers: {
          'X-Auth-Token': configService.get('FOOTBALL_API_TOKEN'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: FOOTBALL_DATA_QUEUE,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
  ],
  providers: [FootballDataProcessor, FootballDataService, SyncService],
  exports: [FootballDataService],
})
export class FootballDataModule {}
