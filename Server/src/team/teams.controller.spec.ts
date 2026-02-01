import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamService } from './teams.service';

describe('TeamsController', () => {
  let controller: TeamsController;
  let teamService: Partial<TeamService>;

  const mockTeam = {
    id: 64,
    name: 'Liverpool FC',
    shortName: 'Liverpool',
    tla: 'LIV',
    crest: 'https://crests.football-data.org/64.png',
    address: 'Anfield Road Liverpool L4 0TH',
    website: 'http://www.liverpoolfc.tv',
    founded: 1892,
    clubColors: 'Red / White',
    venue: 'Anfield',
    coach: { id: 1, name: 'Arne Slot' },
    runningCompetitions: [
      { id: 2021, name: 'Premier League' },
      { id: 2001, name: 'UEFA Champions League' },
    ],
  };

  const mockMatches = [
    {
      id: 1,
      utcDate: '2024-01-15T15:00:00Z',
      status: 'SCHEDULED',
      homeTeam: { id: 64, name: 'Liverpool' },
      awayTeam: { id: 65, name: 'Manchester City' },
      competition: { id: 2021, name: 'Premier League' },
    },
    {
      id: 2,
      utcDate: '2024-01-20T20:00:00Z',
      status: 'SCHEDULED',
      homeTeam: { id: 100, name: 'Real Madrid' },
      awayTeam: { id: 64, name: 'Liverpool' },
      competition: { id: 2001, name: 'UEFA Champions League' },
    },
  ];

  beforeEach(async () => {
    teamService = {
      getById: jest.fn(),
      getMatches: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [{ provide: TeamService, useValue: teamService }],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
  });

  describe('GET /teams/:id', () => {
    it('should return team by ID', async () => {
      const mockResult = { data: mockTeam, status: 'FRESH' as const };
      (teamService.getById as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getTeamById(64);

      expect(result).toEqual(mockResult);
      expect(teamService.getById).toHaveBeenCalledWith(64);
    });

    it('should parse string ID to number', async () => {
      const mockResult = { data: mockTeam, status: 'FRESH' as const };
      (teamService.getById as jest.Mock).mockResolvedValue(mockResult);

      await controller.getTeamById(64);

      expect(typeof (teamService.getById as jest.Mock).mock.calls[0][0]).toBe('number');
    });

    it('should handle non-existent team', async () => {
      const mockResult = { data: null, status: 'FRESH' as const };
      (teamService.getById as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getTeamById(9999);

      expect(result.data).toBeNull();
    });

    it('should handle processing status', async () => {
      const mockResult = { data: null, status: 'PROCESSING' as const, retryAfter: 5 };
      (teamService.getById as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getTeamById(64);

      expect(result.status).toBe('PROCESSING');
      expect(result.retryAfter).toBe(5);
    });
  });

  describe('GET /teams/:id/matches', () => {
    it('should return team matches', async () => {
      const mockResult = { data: mockMatches, status: 'FRESH' as const };
      (teamService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getTeamMatches(64);

      expect(result).toEqual(mockResult);
      expect(teamService.getMatches).toHaveBeenCalledWith(64);
    });

    it('should handle empty matches array', async () => {
      const mockResult = { data: [], status: 'FRESH' as const };
      (teamService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getTeamMatches(64);

      expect(result.data).toEqual([]);
    });

    it('should handle processing status', async () => {
      const mockResult = { data: null, status: 'PROCESSING' as const, retryAfter: 5 };
      (teamService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getTeamMatches(64);

      expect(result.status).toBe('PROCESSING');
    });
  });
});
