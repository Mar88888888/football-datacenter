import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FootballDataService } from './football-data.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: 'https://api.football-data.org/v4',
        headers: {
          'X-Auth-Token': configService.get('FOOTBALL_API_TOKEN'),
        },
      }),
    }),
  ],
  providers: [FootballDataService],
  exports: [FootballDataService],
})
export class FootballDataModule {}
