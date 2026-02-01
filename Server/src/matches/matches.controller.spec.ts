import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { GetMatchesQueryDto } from './dto/getMatchesQuery.dto';

describe('MatchesController', () => {
  let controller: MatchesController;
  let matchesService: Partial<MatchesService>;

  const mockMatches = [
    {
      id: 1,
      utcDate: '2024-01-15T15:00:00Z',
      status: 'SCHEDULED',
      matchday: 21,
      homeTeam: { id: 64, name: 'Liverpool', crest: 'https://crests.football-data.org/64.png' },
      awayTeam: { id: 65, name: 'Manchester City', crest: 'https://crests.football-data.org/65.png' },
      score: { fullTime: { home: null, away: null } },
      competition: { id: 2021, name: 'Premier League' },
    },
    {
      id: 2,
      utcDate: '2024-01-15T17:30:00Z',
      status: 'FINISHED',
      matchday: 21,
      homeTeam: { id: 66, name: 'Arsenal', crest: 'https://crests.football-data.org/66.png' },
      awayTeam: { id: 67, name: 'Chelsea', crest: 'https://crests.football-data.org/67.png' },
      score: { fullTime: { home: 2, away: 1 } },
      competition: { id: 2021, name: 'Premier League' },
    },
  ];

  beforeEach(async () => {
    matchesService = {
      getMatches: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [{ provide: MatchesService, useValue: matchesService }],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
  });

  describe('GET /matches', () => {
    it('should return matches without query params', async () => {
      const mockResult = { data: mockMatches, status: 'FRESH' as const };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const query: GetMatchesQueryDto = {};
      const result = await controller.getMatches(query);

      expect(result).toEqual(mockResult);
      expect(matchesService.getMatches).toHaveBeenCalledWith(query);
    });

    it('should pass date query param to service', async () => {
      const mockResult = { data: mockMatches, status: 'FRESH' as const };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const query: GetMatchesQueryDto = { date: '2024-01-15' };
      await controller.getMatches(query);

      expect(matchesService.getMatches).toHaveBeenCalledWith({ date: '2024-01-15' });
    });

    it('should pass limit query param to service', async () => {
      const mockResult = { data: [mockMatches[0]], status: 'FRESH' as const };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const query: GetMatchesQueryDto = { limit: 1 };
      await controller.getMatches(query);

      expect(matchesService.getMatches).toHaveBeenCalledWith({ limit: 1 });
    });

    it('should pass offset query param to service', async () => {
      const mockResult = { data: [mockMatches[1]], status: 'FRESH' as const };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const query: GetMatchesQueryDto = { offset: 1 };
      await controller.getMatches(query);

      expect(matchesService.getMatches).toHaveBeenCalledWith({ offset: 1 });
    });

    it('should handle all query params together', async () => {
      const mockResult = { data: mockMatches, status: 'FRESH' as const };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const query: GetMatchesQueryDto = { date: '2024-01-15', limit: 10, offset: 5 };
      await controller.getMatches(query);

      expect(matchesService.getMatches).toHaveBeenCalledWith({
        date: '2024-01-15',
        limit: 10,
        offset: 5,
      });
    });

    it('should handle processing status', async () => {
      const mockResult = { data: null, status: 'PROCESSING' as const, retryAfter: 5 };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getMatches({});

      expect(result.status).toBe('PROCESSING');
      expect(result.retryAfter).toBe(5);
    });

    it('should return empty array when no matches', async () => {
      const mockResult = { data: [], status: 'FRESH' as const };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getMatches({ date: '2024-06-01' });

      expect(result.data).toEqual([]);
    });

    it('should handle stale data with refresh in progress', async () => {
      const mockResult = { data: mockMatches, status: 'STALE' as const, isRefreshing: true };
      (matchesService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getMatches({});

      expect(result.status).toBe('STALE');
      expect(result.isRefreshing).toBe(true);
    });
  });
});
