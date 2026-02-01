import { Test, TestingModule } from '@nestjs/testing';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';

describe('StandingsController', () => {
  let controller: StandingsController;
  let standingsService: Partial<StandingsService>;

  const mockStandingsData = {
    competition: { id: 2021, name: 'Premier League' },
    season: { id: 1, startDate: '2024-08-01', endDate: '2025-05-31' },
    standings: [
      {
        stage: 'REGULAR_SEASON',
        type: 'TOTAL',
        group: null,
        table: [
          {
            position: 1,
            team: { id: 64, name: 'Liverpool' },
            playedGames: 20,
            won: 15,
            draw: 3,
            lost: 2,
            points: 48,
            goalsFor: 45,
            goalsAgainst: 18,
            goalDifference: 27,
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    standingsService = {
      getCompetitionStandings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StandingsController],
      providers: [{ provide: StandingsService, useValue: standingsService }],
    }).compile();

    controller = module.get<StandingsController>(StandingsController);
  });

  describe('GET /standings/:competitionId', () => {
    it('should return standings for valid competition ID', async () => {
      const mockResult = { data: mockStandingsData, status: 'FRESH' as const };
      (standingsService.getCompetitionStandings as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getLeagueTable(2021);

      expect(result).toEqual(mockResult);
      expect(standingsService.getCompetitionStandings).toHaveBeenCalledWith(2021);
    });

    it('should pass competitionId as number to service', async () => {
      const mockResult = { data: mockStandingsData, status: 'FRESH' as const };
      (standingsService.getCompetitionStandings as jest.Mock).mockResolvedValue(mockResult);

      await controller.getLeagueTable(2001);

      expect(standingsService.getCompetitionStandings).toHaveBeenCalledWith(2001);
      expect(typeof (standingsService.getCompetitionStandings as jest.Mock).mock.calls[0][0]).toBe('number');
    });

    it('should handle service returning processing status', async () => {
      const mockResult = { data: null, status: 'PROCESSING' as const, retryAfter: 5 };
      (standingsService.getCompetitionStandings as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getLeagueTable(2021);

      expect(result).toEqual(mockResult);
      expect(result.status).toBe('PROCESSING');
    });

    it('should handle service returning stale data', async () => {
      const mockResult = { data: mockStandingsData, status: 'STALE' as const, isRefreshing: true };
      (standingsService.getCompetitionStandings as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getLeagueTable(2021);

      expect(result).toEqual(mockResult);
      expect(result.status).toBe('STALE');
      expect(result.isRefreshing).toBe(true);
    });
  });
});
