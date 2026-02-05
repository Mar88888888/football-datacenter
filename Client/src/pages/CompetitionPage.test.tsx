import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CompetitionPage from './CompetitionPage';
import { createCompetition, createMatches } from '../test-utils';
import type { Competition, Match, Standings, CompetitionFormat } from '../types';

// Mock the hooks
vi.mock('../hooks/useApi');
vi.mock('../hooks/useCompetitionFormat');
vi.mock('../hooks/useFavourite');

// Mock child components to simplify testing
vi.mock('../components/LeagueTable', () => ({
  default: function MockLeagueTable({ competitionId }: { competitionId: string }) {
    return <div data-testid="league-table">LeagueTable: {competitionId}</div>;
  },
}));

vi.mock('../components/GroupStage', () => ({
  default: function MockGroupStage() {
    return <div data-testid="group-stage">GroupStage</div>;
  },
}));

vi.mock('../components/KnockoutBracket', () => ({
  default: function MockKnockoutBracket() {
    return <div data-testid="knockout-bracket">KnockoutBracket</div>;
  },
}));

vi.mock('../components/MatchList', () => ({
  default: function MockMatchList({ matches }: { matches: Match[] }) {
    return <div data-testid="match-list">MatchList: {matches.length} matches</div>;
  },
}));

import { useApi } from '../hooks/useApi';
import useCompetitionFormat from '../hooks/useCompetitionFormat';
import useFavourite from '../hooks/useFavourite';

const mockUseApi = vi.mocked(useApi);
const mockUseCompetitionFormat = vi.mocked(useCompetitionFormat);
const mockUseFavourite = vi.mocked(useFavourite);

interface MockUseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isProcessing: boolean;
  refetch: ReturnType<typeof vi.fn>;
}

// Use trailing comma to disambiguate generic from JSX
function createUseApiResult<T,>(data: T | null, options: Partial<MockUseApiResult<T>> = {}): MockUseApiResult<T> {
  return {
    data,
    loading: false,
    error: null,
    isProcessing: false,
    refetch: vi.fn(),
    ...options,
  };
}

const defaultCompetition = createCompetition({
  id: 2021,
  name: 'Premier League',
  code: 'PL',
  emblem: 'https://example.com/pl.png',
  area: { id: 2072, name: 'England', code: 'ENG', flag: 'https://example.com/england.png' },
  currentSeason: { id: 1, startDate: '2024-08-01', endDate: '2025-05-31', currentMatchday: 21 },
  type: 'LEAGUE',
});

const defaultStandings = {
  competition: defaultCompetition,
  season: defaultCompetition.currentSeason,
  standings: [{ stage: 'REGULAR_SEASON', type: 'TOTAL', group: '', table: [] }],
} as Standings;

const defaultMatches = createMatches(5);

const renderCompetitionPage = (competitionId = '2021') => {
  return render(
    <MemoryRouter initialEntries={[`/competitions/${competitionId}`]}>
      <Routes>
        <Route path="/competitions/:id" element={<CompetitionPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('CompetitionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseApi.mockImplementation((url: string | null) => {
      if (url?.includes('/standings')) {
        return createUseApiResult<Standings>(defaultStandings);
      }
      if (url?.includes('/matches')) {
        return createUseApiResult<Match[]>(defaultMatches);
      }
      return createUseApiResult<Competition>(defaultCompetition);
    });

    mockUseCompetitionFormat.mockReturnValue({
      format: 'league' as CompetitionFormat,
      knockoutMatches: [],
      leagueMatches: defaultMatches,
      disableTeamLinks: false,
    });

    mockUseFavourite.mockReturnValue({
      isFavourite: false,
      loading: false,
      addToFavourite: vi.fn(),
      removeFromFavourite: vi.fn(),
      toggleFavourite: vi.fn(),
    });
  });

  describe('loading state', () => {
    it('should show LoadingSpinner when loading competition', () => {
      mockUseApi.mockImplementation((url: string | null) => {
        if (url?.includes('/standings')) {
          return createUseApiResult<Standings>(null);
        }
        if (url?.includes('/matches')) {
          return createUseApiResult<Match[]>(null);
        }
        return createUseApiResult<Competition>(null, { loading: true });
      });

      renderCompetitionPage();

      expect(screen.getByText('Loading competition data...')).toBeInTheDocument();
    });

    it('should show LoadingSpinner when competition is null', () => {
      mockUseApi.mockImplementation((url: string | null) => {
        if (url?.includes('/standings')) {
          return createUseApiResult<Standings>(null);
        }
        if (url?.includes('/matches')) {
          return createUseApiResult<Match[]>(null);
        }
        return createUseApiResult<Competition>(null);
      });

      renderCompetitionPage();

      expect(screen.getByText('Loading competition data...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show ErrorPage when competition fetch fails', () => {
      mockUseApi.mockImplementation((url: string | null) => {
        if (url?.includes('/standings')) {
          return createUseApiResult<Standings>(null);
        }
        if (url?.includes('/matches')) {
          return createUseApiResult<Match[]>(null);
        }
        return createUseApiResult<Competition>(defaultCompetition, {
          error: new Error('Competition not found'),
        });
      });

      renderCompetitionPage();

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should show ErrorPage when matches fetch fails', () => {
      mockUseApi.mockImplementation((url: string | null) => {
        if (url?.includes('/standings')) {
          return createUseApiResult<Standings>(null);
        }
        if (url?.includes('/matches')) {
          return createUseApiResult<Match[]>(null, {
            error: new Error('Matches not found'),
          });
        }
        return createUseApiResult<Competition>(defaultCompetition);
      });

      renderCompetitionPage();

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('competition header', () => {
    it('should render competition name', () => {
      renderCompetitionPage();

      expect(screen.getByText('Premier League')).toBeInTheDocument();
    });

    it('should render competition emblem', () => {
      renderCompetitionPage();

      const img = screen.getByAltText('Premier League');
      expect(img).toHaveAttribute('src', 'https://example.com/pl.png');
    });

    it('should render area name', () => {
      renderCompetitionPage();

      expect(screen.getByText('England')).toBeInTheDocument();
    });

    it('should render season range', () => {
      renderCompetitionPage();

      expect(screen.getByText('2024/25')).toBeInTheDocument();
    });

    it('should render current matchday', () => {
      renderCompetitionPage();

      expect(screen.getByText('21')).toBeInTheDocument();
    });
  });

  describe('league format', () => {
    beforeEach(() => {
      mockUseCompetitionFormat.mockReturnValue({
        format: 'league',
        knockoutMatches: [],
        leagueMatches: defaultMatches,
        disableTeamLinks: false,
      });
    });

    it('should render LeagueTable', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('league-table')).toBeInTheDocument();
    });

    it('should render MatchList', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('match-list')).toBeInTheDocument();
    });

    it('should show Matches heading', () => {
      renderCompetitionPage();

      expect(screen.getByText('Matches')).toBeInTheDocument();
    });

    it('should not render tabs for league format', () => {
      renderCompetitionPage();

      expect(screen.queryByText('Group Stage')).not.toBeInTheDocument();
      expect(screen.queryByText('Knockout')).not.toBeInTheDocument();
    });
  });

  describe('knockout format', () => {
    beforeEach(() => {
      mockUseCompetitionFormat.mockReturnValue({
        format: 'knockout',
        knockoutMatches: createMatches(8),
        leagueMatches: [],
        disableTeamLinks: false,
      });
    });

    it('should render KnockoutBracket by default', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('knockout-bracket')).toBeInTheDocument();
    });

    it('should render Knockout tab', () => {
      renderCompetitionPage();

      expect(screen.getByRole('button', { name: 'Knockout' })).toBeInTheDocument();
    });

    it('should render All Matches tab', () => {
      renderCompetitionPage();

      expect(screen.getByRole('button', { name: 'All Matches' })).toBeInTheDocument();
    });

    it('should switch to matches view when All Matches tab clicked', () => {
      renderCompetitionPage();

      const allMatchesTab = screen.getByRole('button', { name: 'All Matches' });
      fireEvent.click(allMatchesTab);

      expect(screen.getByTestId('match-list')).toBeInTheDocument();
      expect(screen.getByText('All Matches', { selector: 'h3' })).toBeInTheDocument();
    });
  });

  describe('group_knockout format', () => {
    beforeEach(() => {
      mockUseApi.mockImplementation((url: string | null) => {
        if (url?.includes('/standings')) {
          return createUseApiResult<Standings>({
            competition: defaultCompetition,
            season: defaultCompetition.currentSeason,
            standings: [
              { stage: 'GROUP_STAGE', type: 'TOTAL', group: 'Group A', table: [] },
              { stage: 'GROUP_STAGE', type: 'TOTAL', group: 'Group B', table: [] },
            ],
          } as Standings);
        }
        if (url?.includes('/matches')) {
          return createUseApiResult<Match[]>(defaultMatches);
        }
        return createUseApiResult<Competition>(defaultCompetition);
      });

      mockUseCompetitionFormat.mockReturnValue({
        format: 'group_knockout',
        knockoutMatches: createMatches(4),
        leagueMatches: createMatches(12),
        disableTeamLinks: false,
      });
    });

    it('should render GroupStage by default', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('group-stage')).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      renderCompetitionPage();

      expect(screen.getByRole('button', { name: 'Group Stage' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Knockout' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'All Matches' })).toBeInTheDocument();
    });

    it('should switch to knockout view when Knockout tab clicked', () => {
      renderCompetitionPage();

      const knockoutTab = screen.getByRole('button', { name: 'Knockout' });
      fireEvent.click(knockoutTab);

      expect(screen.getByTestId('knockout-bracket')).toBeInTheDocument();
    });

    it('should switch to matches view when All Matches tab clicked', () => {
      renderCompetitionPage();

      const matchesTab = screen.getByRole('button', { name: 'All Matches' });
      fireEvent.click(matchesTab);

      expect(screen.getByTestId('match-list')).toBeInTheDocument();
    });
  });

  describe('group_stage format', () => {
    beforeEach(() => {
      mockUseApi.mockImplementation((url: string | null) => {
        if (url?.includes('/standings')) {
          return createUseApiResult<Standings>({
            competition: defaultCompetition,
            season: defaultCompetition.currentSeason,
            standings: [
              { stage: 'GROUP_STAGE', type: 'TOTAL', group: 'Group A', table: [] },
            ],
          } as Standings);
        }
        if (url?.includes('/matches')) {
          return createUseApiResult<Match[]>(defaultMatches);
        }
        return createUseApiResult<Competition>(defaultCompetition);
      });

      mockUseCompetitionFormat.mockReturnValue({
        format: 'group_stage',
        knockoutMatches: [],
        leagueMatches: defaultMatches,
        disableTeamLinks: false,
      });
    });

    it('should render GroupStage', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('group-stage')).toBeInTheDocument();
    });

    it('should render MatchList', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('match-list')).toBeInTheDocument();
    });

    it('should not render tabs for group_stage format', () => {
      renderCompetitionPage();

      expect(screen.queryByRole('button', { name: 'Group Stage' })).not.toBeInTheDocument();
    });
  });

  describe('unknown format', () => {
    beforeEach(() => {
      mockUseCompetitionFormat.mockReturnValue({
        format: 'unknown',
        knockoutMatches: [],
        leagueMatches: defaultMatches,
        disableTeamLinks: false,
      });
    });

    it('should render LeagueTable as fallback', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('league-table')).toBeInTheDocument();
    });

    it('should render MatchList', () => {
      renderCompetitionPage();

      expect(screen.getByTestId('match-list')).toBeInTheDocument();
    });
  });

  describe('favourite functionality', () => {
    it('should call toggleFavourite when favourite button clicked', () => {
      const toggleFavourite = vi.fn();
      mockUseFavourite.mockReturnValue({
        isFavourite: false,
        loading: false,
        addToFavourite: vi.fn(),
        removeFromFavourite: vi.fn(),
        toggleFavourite,
      });

      renderCompetitionPage();

      const favButton = screen.getByRole('button', { name: /favourite/i });
      fireEvent.click(favButton);

      expect(toggleFavourite).toHaveBeenCalled();
    });

    it('should show loading state on favourite button', () => {
      mockUseFavourite.mockReturnValue({
        isFavourite: false,
        loading: true,
        addToFavourite: vi.fn(),
        removeFromFavourite: vi.fn(),
        toggleFavourite: vi.fn(),
      });

      renderCompetitionPage();

      const favButton = screen.getByRole('button', { name: /favourite/i });
      expect(favButton).toBeDisabled();
    });
  });

  describe('national team handling', () => {
    it('should disable team links for national team competitions', () => {
      mockUseCompetitionFormat.mockReturnValue({
        format: 'group_knockout',
        knockoutMatches: createMatches(4),
        leagueMatches: createMatches(12),
        disableTeamLinks: true,
      });

      mockUseApi.mockImplementation((url: string | null) => {
        if (url?.includes('/standings')) {
          return createUseApiResult<Standings>({
            competition: defaultCompetition,
            season: defaultCompetition.currentSeason,
            standings: [
              { stage: 'GROUP_STAGE', type: 'TOTAL', group: 'Group A', table: [] },
            ],
          } as Standings);
        }
        if (url?.includes('/matches')) {
          return createUseApiResult<Match[]>(defaultMatches);
        }
        return createUseApiResult<Competition>(
          createCompetition({ code: 'WC', name: 'FIFA World Cup' })
        );
      });

      renderCompetitionPage();

      expect(screen.getByTestId('group-stage')).toBeInTheDocument();
    });
  });
});
