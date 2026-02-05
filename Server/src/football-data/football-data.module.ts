import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FootballDataService } from './football-data.service';
import { FetcherService } from './fetcher.service';
import { SyncService } from './sync.service';

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
  ],
  providers: [FetcherService, FootballDataService, SyncService],
  exports: [FootballDataService],
})
export class FootballDataModule {}
