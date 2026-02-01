import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FavouriteService } from './favourite/favourite.service';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;
  let favouriteService: Partial<FavouriteService>;
  let authService: Partial<AuthService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    favCompetitions: [],
    favTeams: [],
  };

  const mockFavTeams = [
    { id: 1, teamId: 64, name: 'Liverpool FC', crest: 'https://crests.football-data.org/64.png' },
    { id: 2, teamId: 65, name: 'Manchester City', crest: 'https://crests.football-data.org/65.png' },
  ];

  const mockFavComps = [
    { id: 1, competitionId: 2021, name: 'Premier League', emblem: 'https://crests.football-data.org/PL.png' },
    { id: 2, competitionId: 2001, name: 'UEFA Champions League', emblem: 'https://crests.football-data.org/CL.png' },
  ];

  // Mock guards that always allow access
  const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    usersService = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    favouriteService = {
      getFavTeams: jest.fn(),
      getFavComps: jest.fn(),
      addFavTeam: jest.fn(),
      addFavComp: jest.fn(),
      removeFavTeam: jest.fn(),
      removeFavComp: jest.fn(),
    };

    authService = {
      signup: jest.fn(),
      signin: jest.fn(),
      generateJwtToken: jest.fn(),
      getUserFromToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: FavouriteService, useValue: favouriteService },
        { provide: AuthService, useValue: authService },
        { provide: JwtService, useValue: { verify: jest.fn(), sign: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(ThrottlerGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  // ==================== AUTH ENDPOINTS ====================

  describe('POST /user/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const signupResult = { user: mockUser, accessToken: 'initial-token' };
      (authService.signup as jest.Mock).mockResolvedValue(signupResult);
      (authService.generateJwtToken as jest.Mock).mockReturnValue('new-jwt-token');

      const result = await controller.createUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.accessToken).toBe('new-jwt-token');
      expect(authService.signup).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });

    it('should generate JWT with correct payload', async () => {
      const signupResult = { user: mockUser, accessToken: 'initial-token' };
      (authService.signup as jest.Mock).mockResolvedValue(signupResult);
      (authService.generateJwtToken as jest.Mock).mockReturnValue('new-jwt-token');

      await controller.createUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(authService.generateJwtToken).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe('POST /user/auth/signin', () => {
    it('should return token for valid credentials', async () => {
      const signinResult = { user: mockUser, accessToken: 'jwt-token' };
      (authService.signin as jest.Mock).mockResolvedValue(signinResult);

      const result = await controller.signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(authService.signin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should return user without password in response', async () => {
      const signinResult = { user: mockUser, accessToken: 'jwt-token' };
      (authService.signin as jest.Mock).mockResolvedValue(signinResult);

      const result = await controller.signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('POST /user/auth/signout', () => {
    it('should return success message', () => {
      const result = controller.signOut();

      expect(result).toEqual({ message: 'Signed out successfully' });
    });
  });

  describe('GET /user/auth/bytoken', () => {
    it('should return user for valid token', async () => {
      (authService.getUserFromToken as jest.Mock).mockResolvedValue(mockUser);

      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as Request;

      const result = await controller.getUser(mockRequest);

      expect(result).toEqual(mockUser);
      expect(authService.getUserFromToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException for missing authorization header', async () => {
      const mockRequest = {
        headers: {},
      } as unknown as Request;

      await expect(controller.getUser(mockRequest)).rejects.toThrow(UnauthorizedException);
      await expect(controller.getUser(mockRequest)).rejects.toThrow('Authorization header is missing');
    });

    it('should throw UnauthorizedException for missing token', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer ' },
      } as unknown as Request;

      await expect(controller.getUser(mockRequest)).rejects.toThrow(UnauthorizedException);
      await expect(controller.getUser(mockRequest)).rejects.toThrow('Token is missing');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (authService.getUserFromToken as jest.Mock).mockRejectedValue(new Error('Invalid'));

      const mockRequest = {
        headers: { authorization: 'Bearer invalid-token' },
      } as unknown as Request;

      await expect(controller.getUser(mockRequest)).rejects.toThrow(UnauthorizedException);
      await expect(controller.getUser(mockRequest)).rejects.toThrow('Invalid token');
    });
  });

  describe('GET /user/auth/whoami', () => {
    it('should return current user', () => {
      const result = controller.whoAmI(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  // ==================== USER CRUD ENDPOINTS ====================

  describe('GET /user', () => {
    it('should return users filtered by email', async () => {
      (usersService.find as jest.Mock).mockResolvedValue([mockUser]);

      const result = await controller.findAllUsers('test@example.com');

      expect(result).toEqual([mockUser]);
      expect(usersService.find).toHaveBeenCalledWith('test@example.com');
    });

    it('should return empty array when no users found', async () => {
      (usersService.find as jest.Mock).mockResolvedValue([]);

      const result = await controller.findAllUsers('nonexistent@example.com');

      expect(result).toEqual([]);
    });
  });

  describe('GET /user/:id', () => {
    it('should return user by ID', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.findUser('1');

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(controller.findUser('999')).rejects.toThrow(NotFoundException);
      await expect(controller.findUser('999')).rejects.toThrow('user not found');
    });

    it('should parse string ID to number', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

      await controller.findUser('42');

      expect(usersService.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('PATCH /user/:id', () => {
    it('should update user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      (usersService.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.updateUser('1', { name: 'Updated Name' });

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(1, { name: 'Updated Name' });
    });

    it('should parse string ID to number', async () => {
      (usersService.update as jest.Mock).mockResolvedValue(mockUser);

      await controller.updateUser('42', { name: 'Test' });

      expect(usersService.update).toHaveBeenCalledWith(42, { name: 'Test' });
    });
  });

  // ==================== FAVORITE TEAMS ENDPOINTS ====================

  describe('GET /user/favteam', () => {
    it('should return user favorite teams', async () => {
      (favouriteService.getFavTeams as jest.Mock).mockResolvedValue(mockFavTeams);

      const result = await controller.getFavTeams(mockUser);

      expect(result).toEqual(mockFavTeams);
      expect(favouriteService.getFavTeams).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when no favorites', async () => {
      (favouriteService.getFavTeams as jest.Mock).mockResolvedValue([]);

      const result = await controller.getFavTeams(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('POST /user/favteam/:teamid', () => {
    it('should add team to favorites', async () => {
      (favouriteService.addFavTeam as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.addFavTeam(mockUser, '64');

      expect(result).toEqual({ success: true });
      expect(favouriteService.addFavTeam).toHaveBeenCalledWith(mockUser.id, 64);
    });

    it('should parse teamId string to number', async () => {
      (favouriteService.addFavTeam as jest.Mock).mockResolvedValue(undefined);

      await controller.addFavTeam(mockUser, '123');

      expect(favouriteService.addFavTeam).toHaveBeenCalledWith(mockUser.id, 123);
    });

    it('should throw NotFoundException for invalid team', async () => {
      (favouriteService.addFavTeam as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.addFavTeam(mockUser, '9999')).rejects.toThrow(NotFoundException);
      await expect(controller.addFavTeam(mockUser, '9999')).rejects.toThrow('Not found team with id 9999');
    });

    it('should rethrow non-NotFoundException errors', async () => {
      const customError = new Error('Custom error');
      (favouriteService.addFavTeam as jest.Mock).mockRejectedValue(customError);

      await expect(controller.addFavTeam(mockUser, '64')).rejects.toThrow('Custom error');
    });
  });

  describe('DELETE /user/favteam/:teamid', () => {
    it('should remove team from favorites', async () => {
      (favouriteService.removeFavTeam as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.removeFavTeam(mockUser, '64');

      expect(result).toBeUndefined();
      expect(favouriteService.removeFavTeam).toHaveBeenCalledWith(mockUser.id, 64);
    });

    it('should parse teamId string to number', async () => {
      (favouriteService.removeFavTeam as jest.Mock).mockResolvedValue(undefined);

      await controller.removeFavTeam(mockUser, '123');

      expect(favouriteService.removeFavTeam).toHaveBeenCalledWith(mockUser.id, 123);
    });
  });

  // ==================== FAVORITE COMPETITIONS ENDPOINTS ====================

  describe('GET /user/favcomp', () => {
    it('should return user favorite competitions', async () => {
      (favouriteService.getFavComps as jest.Mock).mockResolvedValue(mockFavComps);

      const result = await controller.getFavComp(mockUser);

      expect(result).toEqual(mockFavComps);
      expect(favouriteService.getFavComps).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when no favorites', async () => {
      (favouriteService.getFavComps as jest.Mock).mockResolvedValue([]);

      const result = await controller.getFavComp(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('POST /user/favcomp/:compid', () => {
    it('should add competition to favorites', async () => {
      (favouriteService.addFavComp as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.addFavCompetition(mockUser, '2021');

      expect(result).toEqual({ success: true });
      expect(favouriteService.addFavComp).toHaveBeenCalledWith(mockUser.id, 2021);
    });

    it('should parse compId string to number', async () => {
      (favouriteService.addFavComp as jest.Mock).mockResolvedValue(undefined);

      await controller.addFavCompetition(mockUser, '2001');

      expect(favouriteService.addFavComp).toHaveBeenCalledWith(mockUser.id, 2001);
    });

    it('should throw NotFoundException for invalid competition', async () => {
      (favouriteService.addFavComp as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.addFavCompetition(mockUser, '9999')).rejects.toThrow(NotFoundException);
      await expect(controller.addFavCompetition(mockUser, '9999')).rejects.toThrow('Not found comp with id 9999');
    });

    it('should rethrow non-NotFoundException errors', async () => {
      const customError = new Error('Custom error');
      (favouriteService.addFavComp as jest.Mock).mockRejectedValue(customError);

      await expect(controller.addFavCompetition(mockUser, '2021')).rejects.toThrow('Custom error');
    });
  });

  describe('DELETE /user/favcomp/:compid', () => {
    it('should remove competition from favorites', async () => {
      (favouriteService.removeFavComp as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.removeFavCompetition(mockUser, '2021');

      expect(result).toBeUndefined();
      expect(favouriteService.removeFavComp).toHaveBeenCalledWith(mockUser.id, 2021);
    });

    it('should parse compId string to number', async () => {
      (favouriteService.removeFavComp as jest.Mock).mockResolvedValue(undefined);

      await controller.removeFavCompetition(mockUser, '2001');

      expect(favouriteService.removeFavComp).toHaveBeenCalledWith(mockUser.id, 2001);
    });
  });
});
