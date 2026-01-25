import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: '', // Will be set in tests
    favCompetitions: [],
    favTeams: [],
  };

  beforeEach(async () => {
    usersService = {
      find: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      (usersService.find as jest.Mock).mockResolvedValue([]);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.signup('test@example.com', 'password123', 'Test User');

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should hash the password before storing', async () => {
      (usersService.find as jest.Mock).mockResolvedValue([]);
      (usersService.create as jest.Mock).mockImplementation((email, password, name) => {
        // Password should be in format: salt.hash
        expect(password).toMatch(/^[a-f0-9]{32}\.[a-f0-9]{64}$/);
        return Promise.resolve({ ...mockUser, password });
      });

      await authService.signup('test@example.com', 'password123', 'Test User');

      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already exists', async () => {
      (usersService.find as jest.Mock).mockResolvedValue([mockUser]);

      await expect(
        authService.signup('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow(BadRequestException);

      await expect(
        authService.signup('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('email in use');
    });

    it('should generate JWT with correct payload', async () => {
      (usersService.find as jest.Mock).mockResolvedValue([]);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      await authService.signup('test@example.com', 'password123', 'Test User');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: '7d' }
      );
    });
  });

  describe('signin', () => {
    // Create a properly hashed password for testing
    // This simulates what signup would create
    const salt = 'a'.repeat(32); // 16 bytes = 32 hex chars
    const hashedPart = 'b'.repeat(64); // 32 bytes = 64 hex chars
    const storedPassword = `${salt}.${hashedPart}`;

    it('should throw NotFoundException if user does not exist', async () => {
      (usersService.find as jest.Mock).mockResolvedValue([]);

      await expect(
        authService.signin('nonexistent@example.com', 'password123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const userWithPassword = { ...mockUser, password: storedPassword };
      (usersService.find as jest.Mock).mockResolvedValue([userWithPassword]);

      await expect(
        authService.signin('test@example.com', 'wrongpassword')
      ).rejects.toThrow(BadRequestException);

      await expect(
        authService.signin('test@example.com', 'wrongpassword')
      ).rejects.toThrow('bad password');
    });

    it('should return user and token for valid credentials', async () => {
      // First signup to get a properly hashed password
      (usersService.find as jest.Mock).mockResolvedValueOnce([]); // For signup check

      let createdUser: any;
      (usersService.create as jest.Mock).mockImplementation((email, password, name) => {
        createdUser = { ...mockUser, email, password, name };
        return Promise.resolve(createdUser);
      });

      await authService.signup('test@example.com', 'password123', 'Test User');

      // Now signin with the same password
      (usersService.find as jest.Mock).mockResolvedValue([createdUser]);

      const result = await authService.signin('test@example.com', 'password123');

      expect(result.user).toEqual(createdUser);
      expect(result.accessToken).toBe('mock-jwt-token');
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a JWT token with given payload', () => {
      const payload = { sub: 1, email: 'test@example.com' };

      const result = authService.generateJwtToken(payload);

      expect(result).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(payload, { expiresIn: '7d' });
    });
  });

  describe('getUserFromToken', () => {
    it('should return user for valid token', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 1, email: 'test@example.com' });
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getUserFromToken('valid-token');

      expect(result).toEqual(mockUser);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authService.getUserFromToken('invalid-token')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 999, email: 'deleted@example.com' });
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.getUserFromToken('valid-token-but-user-deleted')
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
