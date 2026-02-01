import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceUnavailableException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FavouriteService } from './favourite.service';
import { UserFavTeam } from './user.favteam.entity';
import { UserFavComp } from './user.favcomp.entity';
import { UsersService } from '../users.service';
import { TeamService } from '../../team/teams.service';
import { CompetitionService } from '../../competitions/competition.service';
import { DataStatus } from '../../common/constants';

describe('FavouriteService', () => {
  let service: FavouriteService;
  let favTeamRepo: Partial<Repository<UserFavTeam>>;
  let favCompRepo: Partial<Repository<UserFavComp>>;
  let usersService: Partial<UsersService>;
  let teamService: Partial<TeamService>;
  let compService: Partial<CompetitionService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    favTeams: [],
    favCompetitions: [],
  };

  const mockTeam = {
    id: 64,
    name: 'Liverpool FC',
    crest: 'https://crests.football-data.org/64.png',
  };

  const mockCompetition = {
    id: 2021,
    name: 'Premier League',
    emblem: 'https://crests.football-data.org/PL.png',
  };

  const mockCompetitions = [
    { id: 2021, name: 'Premier League' },
    { id: 2014, name: 'La Liga' },
    { id: 2002, name: 'Bundesliga' },
  ];

  beforeEach(async () => {
    favTeamRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    };

    favCompRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    };

    usersService = {
      findOne: jest.fn(),
    };

    teamService = {
      getById: jest.fn(),
    };

    compService = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouriteService,
        { provide: getRepositoryToken(UserFavTeam), useValue: favTeamRepo },
        { provide: getRepositoryToken(UserFavComp), useValue: favCompRepo },
        { provide: UsersService, useValue: usersService },
        { provide: TeamService, useValue: teamService },
        { provide: CompetitionService, useValue: compService },
      ],
    }).compile();

    service = module.get<FavouriteService>(FavouriteService);
  });

  // ==================== GET FAV TEAMS ====================

  describe('getFavTeams', () => {
    it('should return favorite teams for user', async () => {
      const mockFavTeams = [
        { id: 1, teamId: 64, name: 'Liverpool FC', crest: 'https://crests.football-data.org/64.png' },
        { id: 2, teamId: 65, name: 'Manchester City', crest: 'https://crests.football-data.org/65.png' },
      ];
      (favTeamRepo.find as jest.Mock).mockResolvedValue(mockFavTeams);

      const result = await service.getFavTeams(1);

      expect(result).toEqual([
        { id: 64, name: 'Liverpool FC', crest: 'https://crests.football-data.org/64.png' },
        { id: 65, name: 'Manchester City', crest: 'https://crests.football-data.org/65.png' },
      ]);
      expect(favTeamRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
      });
    });

    it('should return empty array for user with no favorites', async () => {
      (favTeamRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getFavTeams(1);

      expect(result).toEqual([]);
    });

    it('should map entity to response format', async () => {
      const mockFavTeams = [
        { id: 1, teamId: 100, name: 'Team Name', crest: 'http://example.com/crest.png', user: { id: 1 } },
      ];
      (favTeamRepo.find as jest.Mock).mockResolvedValue(mockFavTeams);

      const result = await service.getFavTeams(1);

      expect(result[0]).toHaveProperty('id', 100);
      expect(result[0]).toHaveProperty('name', 'Team Name');
      expect(result[0]).toHaveProperty('crest', 'http://example.com/crest.png');
      expect(result[0]).not.toHaveProperty('teamId');
      expect(result[0]).not.toHaveProperty('user');
    });
  });

  // ==================== GET FAV COMPS ====================

  describe('getFavComps', () => {
    it('should return favorite competitions for user', async () => {
      const mockFavComps = [
        { id: 1, competitionId: 2021, name: 'Premier League', emblem: 'https://crests.football-data.org/PL.png' },
      ];
      (favCompRepo.find as jest.Mock).mockResolvedValue(mockFavComps);
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: mockCompetitions,
        status: DataStatus.FRESH,
      });

      const result = await service.getFavComps(1);

      expect(result).toEqual([
        { id: 2021, name: 'Premier League', emblem: 'https://crests.football-data.org/PL.png' },
      ]);
    });

    it('should filter out unavailable competitions', async () => {
      const mockFavComps = [
        { id: 1, competitionId: 2021, name: 'Premier League', emblem: 'pl.png' },
        { id: 2, competitionId: 9999, name: 'Unknown League', emblem: 'unknown.png' },
      ];
      (favCompRepo.find as jest.Mock).mockResolvedValue(mockFavComps);
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: [{ id: 2021 }],
        status: DataStatus.FRESH,
      });

      const result = await service.getFavComps(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2021);
    });

    it('should throw ServiceUnavailableException when data is loading', async () => {
      (favCompRepo.find as jest.Mock).mockResolvedValue([]);
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: null,
        status: DataStatus.PROCESSING,
      });

      await expect(service.getFavComps(1)).rejects.toThrow(ServiceUnavailableException);
      await expect(service.getFavComps(1)).rejects.toThrow('Competition data is loading');
    });

    it('should return empty array for user with no favorites', async () => {
      (favCompRepo.find as jest.Mock).mockResolvedValue([]);
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: mockCompetitions,
        status: DataStatus.FRESH,
      });

      const result = await service.getFavComps(1);

      expect(result).toEqual([]);
    });
  });

  // ==================== ADD FAV TEAM ====================

  describe('addFavTeam', () => {
    it('should add team to favorites', async () => {
      (favTeamRepo.findOne as jest.Mock).mockResolvedValue(null);
      (teamService.getById as jest.Mock).mockResolvedValue({
        data: mockTeam,
        status: DataStatus.FRESH,
      });
      (favTeamRepo.insert as jest.Mock).mockResolvedValue({ identifiers: [{ id: 1 }] });

      await service.addFavTeam(1, 64);

      expect(favTeamRepo.insert).toHaveBeenCalledWith({
        user: { id: 1 },
        teamId: 64,
        name: 'Liverpool FC',
        crest: 'https://crests.football-data.org/64.png',
      });
    });

    it('should throw error if team is already favorite', async () => {
      (favTeamRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, teamId: 64 });

      await expect(service.addFavTeam(1, 64)).rejects.toThrow('Team is already a favorite');
    });

    it('should throw ServiceUnavailableException when team data is loading', async () => {
      (favTeamRepo.findOne as jest.Mock).mockResolvedValue(null);
      (teamService.getById as jest.Mock).mockResolvedValue({
        data: null,
        status: DataStatus.PROCESSING,
      });

      await expect(service.addFavTeam(1, 64)).rejects.toThrow(ServiceUnavailableException);
      await expect(service.addFavTeam(1, 64)).rejects.toThrow('Team data is loading');
    });

    it('should store team name and crest from API response', async () => {
      const teamData = { id: 100, name: 'Custom Team', crest: 'http://custom.crest' };
      (favTeamRepo.findOne as jest.Mock).mockResolvedValue(null);
      (teamService.getById as jest.Mock).mockResolvedValue({
        data: teamData,
        status: DataStatus.FRESH,
      });
      (favTeamRepo.insert as jest.Mock).mockResolvedValue({ identifiers: [{ id: 1 }] });

      await service.addFavTeam(1, 100);

      expect(favTeamRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Custom Team',
          crest: 'http://custom.crest',
        }),
      );
    });
  });

  // ==================== ADD FAV COMP ====================

  describe('addFavComp', () => {
    it('should add competition to favorites', async () => {
      (favCompRepo.findOne as jest.Mock).mockResolvedValue(null);
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: mockCompetitions,
        status: DataStatus.FRESH,
      });
      (compService.findById as jest.Mock).mockResolvedValue({
        data: mockCompetition,
        status: DataStatus.FRESH,
      });
      (favCompRepo.insert as jest.Mock).mockResolvedValue({ identifiers: [{ id: 1 }] });

      await service.addFavComp(1, 2021);

      expect(favCompRepo.insert).toHaveBeenCalledWith({
        user: { id: 1 },
        competitionId: 2021,
        name: 'Premier League',
        emblem: 'https://crests.football-data.org/PL.png',
      });
    });

    it('should throw error if competition is not available', async () => {
      (favCompRepo.findOne as jest.Mock).mockResolvedValue(null);
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: [{ id: 2021 }],
        status: DataStatus.FRESH,
      });

      await expect(service.addFavComp(1, 9999)).rejects.toThrow('Competition is not available');
    });

    it('should throw error if competition is already favorite', async () => {
      (favCompRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, competitionId: 2021 });
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: mockCompetitions,
        status: DataStatus.FRESH,
      });

      await expect(service.addFavComp(1, 2021)).rejects.toThrow('Competition is already a favorite');
    });

    it('should throw ServiceUnavailableException when competition data is loading', async () => {
      (favCompRepo.findOne as jest.Mock).mockResolvedValue(null);
      (compService.findAll as jest.Mock).mockResolvedValue({
        data: mockCompetitions,
        status: DataStatus.FRESH,
      });
      (compService.findById as jest.Mock).mockResolvedValue({
        data: null,
        status: DataStatus.PROCESSING,
      });

      await expect(service.addFavComp(1, 2021)).rejects.toThrow(ServiceUnavailableException);
    });
  });

  // ==================== REMOVE FAV TEAM ====================

  describe('removeFavTeam', () => {
    it('should remove team from favorites', async () => {
      const userWithFav = {
        ...mockUser,
        favTeams: [{ id: 1, teamId: 64 }],
      };
      (usersService.findOne as jest.Mock).mockResolvedValue(userWithFav);
      (favTeamRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.removeFavTeam(1, 64);

      expect(favTeamRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should not throw when team is not in favorites', async () => {
      const userWithFav = {
        ...mockUser,
        favTeams: [{ id: 1, teamId: 99 }],
      };
      (usersService.findOne as jest.Mock).mockResolvedValue(userWithFav);

      await expect(service.removeFavTeam(1, 64)).resolves.toBeUndefined();
      expect(favTeamRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.removeFavTeam(1, 64)).rejects.toThrow('User or favorite teams not found');
    });
  });

  // ==================== REMOVE FAV COMP ====================

  describe('removeFavComp', () => {
    it('should remove competition from favorites', async () => {
      const userWithFav = {
        ...mockUser,
        favCompetitions: [{ id: 1, competitionId: 2021 }],
      };
      (usersService.findOne as jest.Mock).mockResolvedValue(userWithFav);
      (favCompRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.removeFavComp(1, 2021);

      expect(favCompRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should not throw when competition is not in favorites', async () => {
      const userWithFav = {
        ...mockUser,
        favCompetitions: [{ id: 1, competitionId: 9999 }],
      };
      (usersService.findOne as jest.Mock).mockResolvedValue(userWithFav);

      await expect(service.removeFavComp(1, 2021)).resolves.toBeUndefined();
      expect(favCompRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.removeFavComp(1, 2021)).rejects.toThrow('User or favorite competitions not found');
    });
  });
});
