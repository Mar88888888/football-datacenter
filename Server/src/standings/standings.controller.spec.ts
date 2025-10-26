import { Test, TestingModule } from '@nestjs/testing';
import { StandingsController } from './standings.controller';

describe('StandingsController', () => {
  let controller: StandingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StandingsController],
    }).compile();

    controller = module.get<StandingsController>(StandingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
