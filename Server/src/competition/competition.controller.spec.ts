import { Test, TestingModule } from '@nestjs/testing';
import { CompetitionController } from './competition.controller';
import { CompetitionService } from './competition.service';

describe('CompetitionController', () => {
  let controller: CompetitionController;
  let competitionService: CompetitionService;

  const mockCompetitionService = {
    searchByName: jest.fn((name) => [{ id: 1, name: `Mocked ${name} League` }]),
    getTopLeagues: jest.fn(() => [{ id: 1, name: 'Top League' }]),
    findById: jest.fn((id) => ({ id, name: 'Specific Competition' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetitionController],
      providers: [
        { provide: CompetitionService, useValue: mockCompetitionService },
      ],
    }).compile();

    controller = module.get<CompetitionController>(CompetitionController);
    competitionService = module.get<CompetitionService>(CompetitionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return competitions by name', async () => {
    const name = 'Premier';
    const result = await controller.searchCompsByName(name);
    expect(result).toEqual([{ id: 1, name: `Mocked ${name} League` }]);
    expect(competitionService.searchByName).toHaveBeenCalledWith(name);
  });

  it('should return top leagues', async () => {
    const result = await controller.getTopLeagues();
    expect(result).toEqual([{ id: 1, name: 'Top League' }]);
    expect(competitionService.getTopLeagues).toHaveBeenCalled();
  });

  it('should return competition by ID', async () => {
    const id = '1';
    const result = await controller.getCompetitionById(id);
    expect(result).toEqual({ id: parseInt(id), name: 'Specific Competition' });
    expect(competitionService.findById).toHaveBeenCalledWith(parseInt(id));
  });
});