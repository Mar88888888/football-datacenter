import type { User } from '../types/auth.types';
import type { FavoriteTeam, FavoriteCompetition } from '../types/favorites.types';

// ==================== AUTH CONTEXT MOCK ====================

export interface MockAuthContextValue {
  user: User | null;
  authToken: string | null;
  loading: boolean;
  saveToken: jest.Mock;
  logout: jest.Mock;
  setUser: jest.Mock;
}

export const createMockAuthContext = (overrides?: Partial<MockAuthContextValue>): MockAuthContextValue => ({
  user: null,
  authToken: null,
  loading: false,
  saveToken: jest.fn(),
  logout: jest.fn(),
  setUser: jest.fn(),
  ...overrides,
});

export const createAuthenticatedAuthContext = (user?: Partial<User>): MockAuthContextValue =>
  createMockAuthContext({
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      ...user,
    },
    authToken: 'mock-jwt-token',
  });

// ==================== FAVOURITES CONTEXT MOCK ====================

export interface MockFavouritesContextValue {
  favTeams: FavoriteTeam[];
  favComps: FavoriteCompetition[];
  loading: boolean;
  addFavTeam: jest.Mock;
  removeFavTeam: jest.Mock;
  isFavTeam: jest.Mock;
  addFavComp: jest.Mock;
  removeFavComp: jest.Mock;
  isFavComp: jest.Mock;
}

export const createMockFavouritesContext = (overrides?: Partial<MockFavouritesContextValue>): MockFavouritesContextValue => ({
  favTeams: [],
  favComps: [],
  loading: false,
  addFavTeam: jest.fn(),
  removeFavTeam: jest.fn(),
  isFavTeam: jest.fn().mockReturnValue(false),
  addFavComp: jest.fn(),
  removeFavComp: jest.fn(),
  isFavComp: jest.fn().mockReturnValue(false),
  ...overrides,
});

// ==================== USE API HOOK MOCK ====================

export interface MockUseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isProcessing: boolean;
  refetch: jest.Mock;
}

export const createMockUseApiResult = <T>(data: T | null, overrides?: Partial<MockUseApiResult<T>>): MockUseApiResult<T> => ({
  data,
  loading: false,
  error: null,
  isProcessing: false,
  refetch: jest.fn(),
  ...overrides,
});

export const createLoadingUseApiResult = <T>(): MockUseApiResult<T> =>
  createMockUseApiResult<T>(null, { loading: true });

export const createErrorUseApiResult = <T>(error: Error): MockUseApiResult<T> =>
  createMockUseApiResult<T>(null, { error });

export const createProcessingUseApiResult = <T>(): MockUseApiResult<T> =>
  createMockUseApiResult<T>(null, { isProcessing: true });

// ==================== ROUTER MOCKS ====================

export const createMockNavigate = (): jest.Mock => jest.fn();

export const createMockUseParams = (params: Record<string, string>): (() => Record<string, string>) =>
  () => params;

// ==================== FETCH MOCK ====================

export const createMockFetchResponse = <T>(data: T, status = 200): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(data),
  headers: new Headers(),
  redirected: false,
  statusText: 'OK',
  type: 'basic',
  url: '',
  clone: jest.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  text: jest.fn(),
  bytes: jest.fn(),
});

export const mockFetch = (response: Response): jest.SpyInstance =>
  jest.spyOn(global, 'fetch').mockResolvedValue(response);

export const mockFetchError = (error: Error): jest.SpyInstance =>
  jest.spyOn(global, 'fetch').mockRejectedValue(error);
