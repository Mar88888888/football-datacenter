import { vi } from 'vitest';
import type { User } from '../types/auth.types';
import type { FavoriteTeam, FavoriteCompetition, HiddenCompetition } from '../types/favorites.types';

type MockFn = ReturnType<typeof vi.fn>;

// ==================== AUTH CONTEXT MOCK ====================

export interface MockAuthContextValue {
  user: User | null;
  authToken: string | null;
  loading: boolean;
  saveToken: MockFn;
  logout: MockFn;
  setUser: MockFn;
}

export const createMockAuthContext = (overrides?: Partial<MockAuthContextValue>): MockAuthContextValue => ({
  user: null,
  authToken: null,
  loading: false,
  saveToken: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
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

// ==================== PREFERENCES CONTEXT MOCK ====================

export interface MockPreferencesContextValue {
  // Favorites
  favTeams: FavoriteTeam[];
  favComps: FavoriteCompetition[];
  loading: boolean;
  addFavTeam: MockFn;
  removeFavTeam: MockFn;
  isFavTeam: MockFn;
  addFavComp: MockFn;
  removeFavComp: MockFn;
  isFavComp: MockFn;
  // Hidden competitions
  hiddenComps: HiddenCompetition[];
  hideComp: MockFn;
  showComp: MockFn;
  isHiddenComp: MockFn;
}

// Legacy alias
export type MockFavouritesContextValue = MockPreferencesContextValue;

export const createMockPreferencesContext = (overrides?: Partial<MockPreferencesContextValue>): MockPreferencesContextValue => ({
  favTeams: [],
  favComps: [],
  loading: false,
  addFavTeam: vi.fn(),
  removeFavTeam: vi.fn(),
  isFavTeam: vi.fn().mockReturnValue(false),
  addFavComp: vi.fn(),
  removeFavComp: vi.fn(),
  isFavComp: vi.fn().mockReturnValue(false),
  hiddenComps: [],
  hideComp: vi.fn(),
  showComp: vi.fn(),
  isHiddenComp: vi.fn().mockReturnValue(false),
  ...overrides,
});

// Legacy alias
export const createMockFavouritesContext = createMockPreferencesContext;

// ==================== USE API HOOK MOCK ====================

export interface MockUseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isProcessing: boolean;
  refetch: MockFn;
}

export const createMockUseApiResult = <T>(data: T | null, overrides?: Partial<MockUseApiResult<T>>): MockUseApiResult<T> => ({
  data,
  loading: false,
  error: null,
  isProcessing: false,
  refetch: vi.fn(),
  ...overrides,
});

export const createLoadingUseApiResult = <T>(): MockUseApiResult<T> =>
  createMockUseApiResult<T>(null, { loading: true });

export const createErrorUseApiResult = <T>(error: Error): MockUseApiResult<T> =>
  createMockUseApiResult<T>(null, { error });

export const createProcessingUseApiResult = <T>(): MockUseApiResult<T> =>
  createMockUseApiResult<T>(null, { isProcessing: true });

// ==================== ROUTER MOCKS ====================

export const createMockNavigate = (): MockFn => vi.fn();

export const createMockUseParams = (params: Record<string, string>): (() => Record<string, string>) =>
  () => params;

// ==================== FETCH MOCK ====================

export const createMockFetchResponse = <T>(data: T, status = 200): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  headers: new Headers(),
  redirected: false,
  statusText: 'OK',
  type: 'basic',
  url: '',
  clone: vi.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: vi.fn(),
  blob: vi.fn(),
  formData: vi.fn(),
  text: vi.fn(),
  bytes: vi.fn(),
});

export const mockFetch = (response: Response) =>
  vi.spyOn(global, 'fetch').mockResolvedValue(response);

export const mockFetchError = (error: Error) =>
  vi.spyOn(global, 'fetch').mockRejectedValue(error);
