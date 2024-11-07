import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

describe('PlayerController', () => {
  let controller: PlayerController;
  let playerService: PlayerService;

  const mockPlayerService = {
    getTeamPlayers: jest.fn((teamId) => [{ id: 1, name: 'Player 1', teamId }]),
    getPlayerById: jest.fn((id) => ({ id, name: 'Player 1' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [{ provide: PlayerService, useValue: mockPlayerService }],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
    playerService = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return players from a specific team', async () => {
    const teamId = '1';
    const result = await controller.getTeamPlayers(teamId);
    expect(result).toEqual([{ id: 1, name: 'Player 1', teamId: parseInt(teamId) }]);
    expect(playerService.getTeamPlayers).toHaveBeenCalledWith(parseInt(teamId));
  });

  it('should return a player by ID', async () => {
    const id = '1';
    const result = await controller.getPlayerById(id);
    expect(result).toEqual({ id: parseInt(id), name: 'Player 1' });
    expect(playerService.getPlayerById).toHaveBeenCalledWith(parseInt(id));
  });
});
