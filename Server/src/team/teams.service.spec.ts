import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './teams.service';

describe('TeamsService', () => {
  let service: TeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamService],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
