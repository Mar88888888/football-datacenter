import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FootballDataClient } from './football-data.client';

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
  providers: [FootballDataClient],
  exports: [FootballDataClient],
})
export class FootballDataModule {}
