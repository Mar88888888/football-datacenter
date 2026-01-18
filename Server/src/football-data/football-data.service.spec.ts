import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FootballDataService } from './football-data.service';
import { FOOTBALL_DATA_QUEUE } from './football-data.types';

describe('FootballDataService', () => {
  let service: FootballDataService;

  const mockQueue = {
    add: jest.fn(),
    getJob: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FootballDataService,
        {
          provide: getQueueToken(FOOTBALL_DATA_QUEUE),
          useValue: mockQueue,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<FootballDataService>(FootballDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
