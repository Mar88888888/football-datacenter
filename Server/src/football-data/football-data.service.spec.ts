import { Test, TestingModule } from '@nestjs/testing';
import { FootballDataClient } from './football-data.client';

describe('FootballDataService', () => {
  let service: FootballDataClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FootballDataClient],
    }).compile();

    service = module.get<FootballDataClient>(FootballDataClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
