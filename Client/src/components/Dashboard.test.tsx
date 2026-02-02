import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AuthContext } from '../context/AuthContext';
import { FavouritesContext } from '../context/FavouritesContext';
import {
  createMockAuthContext,
  createAuthenticatedAuthContext,
  createMockFavouritesContext,
  createFavoriteTeam,
  createFavoriteCompetition,
} from '../test-utils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...await vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

interface RenderOptions {
  authContext?: ReturnType<typeof createMockAuthContext>;
  favContext?: ReturnType<typeof createMockFavouritesContext>;
}

const renderDashboard = (options: RenderOptions = {}) => {
  const authContext = options.authContext ?? createAuthenticatedAuthContext();
  const favContext = options.favContext ?? createMockFavouritesContext();

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContext}>
        <FavouritesContext.Provider value={favContext}>
          <Dashboard />
        </FavouritesContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show LoadingSpinner when loading', () => {
      renderDashboard({
        favContext: createMockFavouritesContext({ loading: true }),
      });

      expect(screen.getByText('Loading your favorites...')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show "no favourite teams" message when empty', () => {
      renderDashboard({
        favContext: createMockFavouritesContext({ favTeams: [], favComps: [] }),
      });

      expect(screen.getByText('You have no favourite teams')).toBeInTheDocument();
    });

    it('should show "no favourite competitions" message when empty', () => {
      renderDashboard({
        favContext: createMockFavouritesContext({ favTeams: [], favComps: [] }),
      });

      expect(screen.getByText('You have no favourite competitions')).toBeInTheDocument();
    });
  });

  describe('favorites display', () => {
    it('should render favorite teams grid', () => {
      const favTeams = [
        createFavoriteTeam({ id: 64, name: 'Liverpool FC' }),
        createFavoriteTeam({ id: 65, name: 'Manchester City' }),
      ];
      renderDashboard({
        favContext: createMockFavouritesContext({ favTeams }),
      });

      expect(screen.getByText('Liverpool FC')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    it('should render favorite competitions grid', () => {
      const favComps = [
        createFavoriteCompetition({ id: 2021, name: 'Premier League' }),
        createFavoriteCompetition({ id: 2014, name: 'La Liga' }),
      ];
      renderDashboard({
        favContext: createMockFavouritesContext({ favComps }),
      });

      expect(screen.getByText('Premier League')).toBeInTheDocument();
      expect(screen.getByText('La Liga')).toBeInTheDocument();
    });

    it('should link teams to team pages', () => {
      const favTeams = [createFavoriteTeam({ id: 64, name: 'Liverpool FC' })];
      renderDashboard({
        favContext: createMockFavouritesContext({ favTeams }),
      });

      const link = screen.getByRole('link', { name: /Liverpool FC/i });
      expect(link).toHaveAttribute('href', '/teams/64');
    });

    it('should link competitions to competition pages', () => {
      const favComps = [createFavoriteCompetition({ id: 2021, name: 'Premier League' })];
      renderDashboard({
        favContext: createMockFavouritesContext({ favComps }),
      });

      const link = screen.getByRole('link', { name: /Premier League/i });
      expect(link).toHaveAttribute('href', '/competitions/2021');
    });

    it('should display team crests', () => {
      const favTeams = [
        createFavoriteTeam({ id: 64, name: 'Liverpool FC', crest: 'https://example.com/liv.png' }),
      ];
      renderDashboard({
        favContext: createMockFavouritesContext({ favTeams }),
      });

      const img = screen.getByAltText('Liverpool FC');
      expect(img).toHaveAttribute('src', 'https://example.com/liv.png');
    });

    it('should display competition emblems', () => {
      const favComps = [
        createFavoriteCompetition({ id: 2021, name: 'Premier League', emblem: 'https://example.com/pl.png' }),
      ];
      renderDashboard({
        favContext: createMockFavouritesContext({ favComps }),
      });

      const img = screen.getByAltText('Premier League');
      expect(img).toHaveAttribute('src', 'https://example.com/pl.png');
    });
  });

  describe('logout functionality', () => {
    it('should call logout on button click', () => {
      const authContext = createAuthenticatedAuthContext();
      renderDashboard({ authContext });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      expect(authContext.logout).toHaveBeenCalled();
    });

    it('should navigate to /login after logout', () => {
      const authContext = createAuthenticatedAuthContext();
      renderDashboard({ authContext });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('section headers', () => {
    it('should have Favorite Teams heading', () => {
      renderDashboard();

      expect(screen.getByRole('heading', { name: /Favorite Teams/i })).toBeInTheDocument();
    });

    it('should have Favorite Competitions heading', () => {
      renderDashboard();

      expect(screen.getByRole('heading', { name: /Favorite Competitions/i })).toBeInTheDocument();
    });
  });
});
