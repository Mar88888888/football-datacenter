import { Test, TestingModule } from '@nestjs/testing';
import { CompetitionController } from './competition.controller';
import { CompetitionService } from './competition.service';

describe('CompetitionController', () => {
  let controller: CompetitionController;
  let competitionService: Partial<CompetitionService>;

  const mockCompetition = {
    id: 2021,
    name: 'Premier League',
    code: 'PL',
    emblem: 'https://crests.football-data.org/PL.png',
    area: { id: 2072, name: 'England' },
    currentSeason: { id: 1, startDate: '2024-08-01', endDate: '2025-05-31' },
  };

  const mockCompetitions = [
    mockCompetition,
    { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
    { id: 2002, name: 'Bundesliga', code: 'BL1', emblem: 'https://crests.football-data.org/BL1.png' },
  ];

  const mockMatches = [
    {
      id: 1,
      utcDate: '2024-01-15T15:00:00Z',
      status: 'SCHEDULED',
      homeTeam: { id: 64, name: 'Liverpool' },
      awayTeam: { id: 65, name: 'Manchester City' },
    },
    {
      id: 2,
      utcDate: '2024-01-15T17:30:00Z',
      status: 'SCHEDULED',
      homeTeam: { id: 66, name: 'Arsenal' },
      awayTeam: { id: 67, name: 'Chelsea' },
    },
  ];

  beforeEach(async () => {
    competitionService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      getMatches: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetitionController],
      providers: [{ provide: CompetitionService, useValue: competitionService }],
    }).compile();

    controller = module.get<CompetitionController>(CompetitionController);
  });

  describe('GET /competitions', () => {
    it('should return all competitions', async () => {
      const mockResult = { data: mockCompetitions, status: 'FRESH' as const };
      (competitionService.findAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getAllCompetitions();

      expect(result).toEqual(mockResult);
      expect(competitionService.findAll).toHaveBeenCalled();
    });

    it('should handle empty competition list', async () => {
      const mockResult = { data: [], status: 'FRESH' as const };
      (competitionService.findAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getAllCompetitions();

      expect(result.data).toEqual([]);
    });

    it('should handle processing status', async () => {
      const mockResult = { data: null, status: 'PROCESSING' as const, retryAfter: 5 };
      (competitionService.findAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getAllCompetitions();

      expect(result.status).toBe('PROCESSING');
    });
  });

  describe('GET /competitions/:id', () => {
    it('should return competition by ID', async () => {
      const mockResult = { data: mockCompetition, status: 'FRESH' as const };
      (competitionService.findById as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getCompetitionById(2021);

      expect(result).toEqual(mockResult);
      expect(competitionService.findById).toHaveBeenCalledWith(2021);
    });

    it('should parse string ID to number', async () => {
      const mockResult = { data: mockCompetition, status: 'FRESH' as const };
      (competitionService.findById as jest.Mock).mockResolvedValue(mockResult);

      await controller.getCompetitionById(2021);

      expect(typeof (competitionService.findById as jest.Mock).mock.calls[0][0]).toBe('number');
    });

    it('should handle non-existent competition', async () => {
      const mockResult = { data: null, status: 'FRESH' as const };
      (competitionService.findById as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getCompetitionById(9999);

      expect(result.data).toBeNull();
    });
  });

  describe('GET /competitions/:id/matches', () => {
    it('should return matches for competition', async () => {
      const mockResult = { data: mockMatches, status: 'FRESH' as const };
      (competitionService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getCompetitionMatches(2021);

      expect(result).toEqual(mockResult);
      expect(competitionService.getMatches).toHaveBeenCalledWith(2021);
    });

    it('should handle empty matches array', async () => {
      const mockResult = { data: [], status: 'FRESH' as const };
      (competitionService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getCompetitionMatches(2021);

      expect(result.data).toEqual([]);
    });

    it('should handle processing status', async () => {
      const mockResult = { data: null, status: 'PROCESSING' as const, retryAfter: 5 };
      (competitionService.getMatches as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getCompetitionMatches(2021);

      expect(result.status).toBe('PROCESSING');
    });
  });
});
