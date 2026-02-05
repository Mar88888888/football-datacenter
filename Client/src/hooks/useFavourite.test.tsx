import { renderHook, act } from '@testing-library/react';
import React from 'react';
import useFavourite from './useFavourite';
import { AuthContext } from '../context/AuthContext';
import { FavouritesContext } from '../context/FavouritesContext';
import type { FavoriteTeam, FavoriteCompetition } from '../types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// Mock alert
const mockAlert = vi.fn();
global.alert = mockAlert;

// Helper to create wrapper with contexts
interface WrapperProps {
  children: React.ReactNode;
}

interface ContextValues {
  user: { id: number; email: string; name: string } | null;
  authToken: string | null;
  loading: boolean;
  saveToken: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  setUser: ReturnType<typeof vi.fn>;
  favTeams: FavoriteTeam[];
  favComps: FavoriteCompetition[];
  isFavTeam: ReturnType<typeof vi.fn>;
  isFavComp: ReturnType<typeof vi.fn>;
  addFavTeam: ReturnType<typeof vi.fn>;
  removeFavTeam: ReturnType<typeof vi.fn>;
  addFavComp: ReturnType<typeof vi.fn>;
  removeFavComp: ReturnType<typeof vi.fn>;
  favLoading: boolean;
}

const createWrapper = (contextValues: Partial<ContextValues> = {}) => {
  const authValue = {
    user: contextValues.user ?? null,
    authToken: contextValues.authToken ?? null,
    loading: contextValues.loading ?? false,
    saveToken: contextValues.saveToken ?? vi.fn(),
    logout: contextValues.logout ?? vi.fn(),
    setUser: contextValues.setUser ?? vi.fn(),
  };

  const favValue = {
    favTeams: contextValues.favTeams ?? [],
    favComps: contextValues.favComps ?? [],
    loading: contextValues.favLoading ?? false,
    isFavTeam: contextValues.isFavTeam ?? vi.fn().mockReturnValue(false),
    isFavComp: contextValues.isFavComp ?? vi.fn().mockReturnValue(false),
    addFavTeam: contextValues.addFavTeam ?? vi.fn().mockResolvedValue(undefined),
    removeFavTeam: contextValues.removeFavTeam ?? vi.fn().mockResolvedValue(undefined),
    addFavComp: contextValues.addFavComp ?? vi.fn().mockResolvedValue(undefined),
    removeFavComp: contextValues.removeFavComp ?? vi.fn().mockResolvedValue(undefined),
  };

  return ({ children }: WrapperProps) => (
    <AuthContext.Provider value={authValue}>
      <FavouritesContext.Provider value={favValue}>{children}</FavouritesContext.Provider>
    </AuthContext.Provider>
  );
};

const testUser = { id: 1, email: 'test@example.com', name: 'Test User' };
const testTeam: FavoriteTeam = { id: 64, name: 'Liverpool FC', crest: 'https://example.com/liv.png' };
const testComp: FavoriteCompetition = { id: 2021, name: 'Premier League', emblem: 'https://example.com/pl.png' };

describe('useFavourite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isFavourite detection', () => {
    it('should return false when team is not a favourite', () => {
      const isFavTeam = vi.fn().mockReturnValue(false);
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, isFavTeam }),
      });

      expect(result.current.isFavourite).toBe(false);
      expect(isFavTeam).toHaveBeenCalledWith(64);
    });

    it('should return true when team is a favourite', () => {
      const isFavTeam = vi.fn().mockReturnValue(true);
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, isFavTeam }),
      });

      expect(result.current.isFavourite).toBe(true);
    });

    it('should return false when competition is not a favourite', () => {
      const isFavComp = vi.fn().mockReturnValue(false);
      const { result } = renderHook(() => useFavourite('competition', 2021, testComp), {
        wrapper: createWrapper({ user: testUser, isFavComp }),
      });

      expect(result.current.isFavourite).toBe(false);
      expect(isFavComp).toHaveBeenCalledWith(2021);
    });

    it('should return true when competition is a favourite', () => {
      const isFavComp = vi.fn().mockReturnValue(true);
      const { result } = renderHook(() => useFavourite('competition', 2021, testComp), {
        wrapper: createWrapper({ user: testUser, isFavComp }),
      });

      expect(result.current.isFavourite).toBe(true);
    });

    it('should handle string ID', () => {
      const isFavTeam = vi.fn().mockReturnValue(true);
      const { result } = renderHook(() => useFavourite('team', '64', testTeam), {
        wrapper: createWrapper({ user: testUser, isFavTeam }),
      });

      expect(result.current.isFavourite).toBe(true);
      expect(isFavTeam).toHaveBeenCalledWith('64');
    });
  });

  describe('loading state', () => {
    it('should reflect context loading state', () => {
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, favLoading: true }),
      });

      expect(result.current.loading).toBe(true);
    });

    it('should combine context loading with mutation loading', async () => {
      const addFavTeam = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, addFavTeam }),
      });

      expect(result.current.loading).toBe(false);

      // Start adding
      act(() => {
        result.current.addToFavourite();
      });

      // Should be loading during mutation
      expect(result.current.loading).toBe(true);
    });
  });

  describe('addToFavourite', () => {
    it('should navigate to login when no user', async () => {
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: null }),
      });

      await act(async () => {
        await result.current.addToFavourite();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should not add when item is null', async () => {
      const addFavTeam = vi.fn();
      const { result } = renderHook(() => useFavourite('team', 64, null), {
        wrapper: createWrapper({ user: testUser, addFavTeam }),
      });

      await act(async () => {
        await result.current.addToFavourite();
      });

      expect(addFavTeam).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Item object required for adding to favourites');
    });

    it('should call addFavTeam for team type', async () => {
      const addFavTeam = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, addFavTeam }),
      });

      await act(async () => {
        await result.current.addToFavourite();
      });

      expect(addFavTeam).toHaveBeenCalledWith(testTeam);
    });

    it('should call addFavComp for competition type', async () => {
      const addFavComp = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFavourite('competition', 2021, testComp), {
        wrapper: createWrapper({ user: testUser, addFavComp }),
      });

      await act(async () => {
        await result.current.addToFavourite();
      });

      expect(addFavComp).toHaveBeenCalledWith(testComp);
    });

    it('should handle add error and show alert', async () => {
      const error = new Error('Add failed');
      const addFavTeam = vi.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, addFavTeam }),
      });

      await act(async () => {
        await result.current.addToFavourite();
      });

      expect(console.error).toHaveBeenCalledWith('Error adding to favourites:', error);
      expect(mockAlert).toHaveBeenCalledWith('Add failed');
    });

    it('should show default error message when error has no message', async () => {
      const addFavTeam = vi.fn().mockRejectedValue({});
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, addFavTeam }),
      });

      await act(async () => {
        await result.current.addToFavourite();
      });

      expect(mockAlert).toHaveBeenCalledWith('An error occurred. Please try again later.');
    });
  });

  describe('removeFromFavourite', () => {
    it('should call removeFavTeam for team type', async () => {
      const removeFavTeam = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, removeFavTeam }),
      });

      await act(async () => {
        await result.current.removeFromFavourite();
      });

      expect(removeFavTeam).toHaveBeenCalledWith(64);
    });

    it('should call removeFavComp for competition type', async () => {
      const removeFavComp = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFavourite('competition', 2021, testComp), {
        wrapper: createWrapper({ user: testUser, removeFavComp }),
      });

      await act(async () => {
        await result.current.removeFromFavourite();
      });

      expect(removeFavComp).toHaveBeenCalledWith(2021);
    });

    it('should convert string ID to number', async () => {
      const removeFavTeam = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFavourite('team', '64', testTeam), {
        wrapper: createWrapper({ user: testUser, removeFavTeam }),
      });

      await act(async () => {
        await result.current.removeFromFavourite();
      });

      expect(removeFavTeam).toHaveBeenCalledWith(64);
    });

    it('should handle remove error and show alert', async () => {
      const error = new Error('Remove failed');
      const removeFavTeam = vi.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, removeFavTeam }),
      });

      await act(async () => {
        await result.current.removeFromFavourite();
      });

      expect(console.error).toHaveBeenCalledWith('Error removing from favourites:', error);
      expect(mockAlert).toHaveBeenCalledWith('Remove failed');
    });
  });

  describe('toggleFavourite', () => {
    it('should call removeFromFavourite when already a favourite', async () => {
      const isFavTeam = vi.fn().mockReturnValue(true);
      const removeFavTeam = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, isFavTeam, removeFavTeam }),
      });

      await act(async () => {
        result.current.toggleFavourite();
      });

      expect(removeFavTeam).toHaveBeenCalledWith(64);
    });

    it('should call addToFavourite when not a favourite', async () => {
      const isFavTeam = vi.fn().mockReturnValue(false);
      const addFavTeam = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFavourite('team', 64, testTeam), {
        wrapper: createWrapper({ user: testUser, isFavTeam, addFavTeam }),
      });

      await act(async () => {
        result.current.toggleFavourite();
      });

      expect(addFavTeam).toHaveBeenCalledWith(testTeam);
    });

    it('should toggle competition favourite', async () => {
      const isFavComp = vi.fn().mockReturnValue(false);
      const addFavComp = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFavourite('competition', 2021, testComp), {
        wrapper: createWrapper({ user: testUser, isFavComp, addFavComp }),
      });

      await act(async () => {
        result.current.toggleFavourite();
      });

      expect(addFavComp).toHaveBeenCalledWith(testComp);
    });
  });
});
