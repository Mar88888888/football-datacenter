import { Test, TestingModule } from '@nestjs/testing';
import { FootballDataService } from './football-data.service';

describe('FootballDataService', () => {
  let service: FootballDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FootballDataService],
    }).compile();

    service = module.get<FootballDataService>(FootballDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
