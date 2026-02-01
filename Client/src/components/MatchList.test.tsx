import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MatchList from './MatchList';
import { createMatch, createScheduledMatch, createInPlayMatch, createFinishedMatch, createMatches } from '../test-utils';

// Wrapper for router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('MatchList', () => {
  describe('rendering', () => {
    it('should render empty state when no matches', () => {
      renderWithRouter(<MatchList matches={[]} />);

      // No list items should be present
      const listItems = screen.queryAllByRole('listitem');
      expect(listItems).toHaveLength(0);
    });

    it('should render matches correctly', () => {
      const matches = [createMatch({ id: 1 }), createMatch({ id: 2 })];
      renderWithRouter(<MatchList matches={matches} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('should render team names', () => {
      const match = createMatch({
        homeTeam: { id: 64, name: 'Liverpool FC', shortName: 'Liverpool', crest: 'test.png' },
        awayTeam: { id: 65, name: 'Manchester City', shortName: 'Man City', crest: 'test.png' },
      });
      renderWithRouter(<MatchList matches={[match]} />);

      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Man City')).toBeInTheDocument();
    });

    it('should render team crests', () => {
      const match = createMatch();
      renderWithRouter(<MatchList matches={[match]} />);

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(2); // At least home and away team crests
    });

    it('should render competition name', () => {
      const match = createMatch({
        competition: {
          id: 2021,
          name: 'Premier League',
          code: 'PL',
          emblem: 'test.png',
          area: { id: 1, name: 'England' },
          currentSeason: { id: 1, startDate: '2024-08-01', endDate: '2025-05-31' },
          type: 'LEAGUE',
        },
      });
      renderWithRouter(<MatchList matches={[match]} />);

      expect(screen.getByText('Premier League')).toBeInTheDocument();
    });

    it('should render matchday when available', () => {
      const match = createMatch({ matchday: 21 });
      renderWithRouter(<MatchList matches={[match]} />);

      expect(screen.getByText('Matchday 21')).toBeInTheDocument();
    });

    it('should handle TBD team gracefully', () => {
      const match = createMatch({
        homeTeam: { id: 0, name: '', crest: '' },
      });
      renderWithRouter(<MatchList matches={[match]} />);

      expect(screen.getByText('TBD')).toBeInTheDocument();
    });
  });

  describe('match status display', () => {
    it('should show "vs" for SCHEDULED status', () => {
      const match = createScheduledMatch();
      renderWithRouter(<MatchList matches={[match]} />);

      expect(screen.getByText('vs')).toBeInTheDocument();
    });

    it('should show "vs" for TIMED status', () => {
      const match = createMatch({ status: 'TIMED' });
      renderWithRouter(<MatchList matches={[match]} />);

      expect(screen.getByText('vs')).toBeInTheDocument();
    });

    it('should show score in yellow for IN_PLAY status', () => {
      const match = createInPlayMatch();
      renderWithRouter(<MatchList matches={[match]} />);

      const scoreElement = screen.getByText('1 - 0');
      expect(scoreElement).toHaveClass('text-yellow-400');
    });

    it('should show score in yellow for PAUSED status', () => {
      const match = createMatch({
        status: 'PAUSED',
        score: { fullTime: { home: 2, away: 1 } },
      });
      renderWithRouter(<MatchList matches={[match]} />);

      const scoreElement = screen.getByText('2 - 1');
      expect(scoreElement).toHaveClass('text-yellow-400');
    });

    it('should show score in green for FINISHED status', () => {
      const match = createFinishedMatch();
      renderWithRouter(<MatchList matches={[match]} />);

      const scoreElement = screen.getByText('2 - 1');
      expect(scoreElement).toHaveClass('text-green-400');
    });
  });

  describe('pagination', () => {
    it('should not show pagination for single page', () => {
      const matches = createMatches(5);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });

    it('should show pagination controls for multiple pages', () => {
      const matches = createMatches(15);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    it('should navigate to next page', () => {
      const matches = createMatches(15);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      const nextButton = screen.getByText('›');
      fireEvent.click(nextButton);

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      const matches = createMatches(25);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      // Go to page 2 first
      fireEvent.click(screen.getByText('›'));
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

      // Go back to page 1
      fireEvent.click(screen.getByText('‹'));
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('should disable prev on first page', () => {
      const matches = createMatches(15);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      const prevButton = screen.getByText('‹');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next on last page', () => {
      const matches = createMatches(15);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      // Go to last page
      fireEvent.click(screen.getByText('»'));

      const nextButton = screen.getByText('›');
      expect(nextButton).toBeDisabled();
    });

    it('should navigate to first page with double arrow', () => {
      const matches = createMatches(25);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      // Go to last page
      fireEvent.click(screen.getByText('»'));
      expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();

      // Go to first page
      fireEvent.click(screen.getByText('«'));
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('should navigate to last page with double arrow', () => {
      const matches = createMatches(25);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      fireEvent.click(screen.getByText('»'));
      expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    });

    it('should show Today button', () => {
      const matches = createMatches(15);
      renderWithRouter(<MatchList matches={matches} pageSize={10} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('TeamCard linking', () => {
    it('should render team as link when not national team', () => {
      const match = createMatch({
        homeTeam: { id: 64, name: 'Liverpool', crest: 'test.png' },
      });
      renderWithRouter(<MatchList matches={[match]} isNationalTeam={false} />);

      const link = screen.getByRole('link', { name: /Liverpool/i });
      expect(link).toHaveAttribute('href', '/teams/64');
    });

    it('should render team as div when isNationalTeam is true', () => {
      const match = createMatch({
        homeTeam: { id: 64, name: 'Liverpool', crest: 'test.png' },
      });
      renderWithRouter(<MatchList matches={[match]} isNationalTeam={true} />);

      // Should not be a link
      const links = screen.queryAllByRole('link');
      const teamLinks = links.filter(link => link.getAttribute('href')?.includes('/teams/'));
      expect(teamLinks).toHaveLength(0);
    });

    it('should not link team without ID', () => {
      const match = createMatch({
        homeTeam: { id: 0, name: 'TBD', crest: '' },
        awayTeam: { id: 65, name: 'Man City', crest: 'test.png' },
      });
      renderWithRouter(<MatchList matches={[match]} isNationalTeam={false} />);

      // Only away team should have a link
      const links = screen.queryAllByRole('link');
      const teamLinks = links.filter(link => link.getAttribute('href')?.includes('/teams/'));
      expect(teamLinks).toHaveLength(1);
      expect(teamLinks[0]).toHaveAttribute('href', '/teams/65');
    });
  });

  describe('page size', () => {
    it('should respect custom page size', () => {
      const matches = createMatches(10);
      renderWithRouter(<MatchList matches={matches} pageSize={5} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(5);
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });
  });
});
