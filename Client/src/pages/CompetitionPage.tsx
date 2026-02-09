import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import useCompetitionFormat from '../hooks/useCompetitionFormat';
import useFavourite from '../hooks/useFavourite';
import LeagueTable from '../components/LeagueTable';
import GroupStage from '../components/GroupStage';
import KnockoutBracket from '../components/KnockoutBracket';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from './ErrorPage';
import { API_ENDPOINTS } from '../constants';
import type { Competition, Match, Standings, Scorer } from '../types';

type TabType = 'standings' | 'scorers' | 'matches' | 'knockout';

const CompetitionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('standings');
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);

  // Fetch competition data
  const {
    data: competition,
    loading: loadingCompetition,
    error: competitionError,
  } = useApi<Competition>(API_ENDPOINTS.COMPETITION(id!));

  // Fetch standings
  const { data: standings } = useApi<Standings>(API_ENDPOINTS.STANDINGS(id!));

  // Fetch matches
  const { data: matchesData, error: matchesError } = useApi<Match[]>(
    API_ENDPOINTS.COMPETITION_MATCHES(id!)
  );
  const matches = matchesData || [];

  // Fetch scorers
  const { data: scorersData } = useApi<Scorer[]>(API_ENDPOINTS.COMPETITION_SCORERS(id!));
  const scorers = scorersData || [];

  // Competition format detection
  const { format, knockoutMatches, leagueMatches, disableTeamLinks } = useCompetitionFormat(
    standings,
    matches,
    competition
  );

  // Favourite management
  const {
    isFavourite,
    loading: favouriteLoading,
    toggleFavourite,
  } = useFavourite('competition', id!, competition);

  const error = competitionError || matchesError;

  // Compute matchdays for pagination
  const { matchdays, matchdayMatches, closestMatchday } = useMemo(() => {
    const matchesToUse = format === 'group_knockout' || format === 'group_stage'
      ? leagueMatches
      : matches;

    // Get unique matchdays, filtering out undefined/null
    const uniqueMatchdays = [...new Set(
      matchesToUse
        .filter((m) => m.matchday != null)
        .map((m) => m.matchday as number)
    )].sort((a, b) => a - b);

    // Group matches by matchday
    const byMatchday: Record<number, Match[]> = {};
    matchesToUse.forEach((m) => {
      if (m.matchday != null) {
        if (!byMatchday[m.matchday]) {
          byMatchday[m.matchday] = [];
        }
        byMatchday[m.matchday].push(m);
      }
    });

    // Find closest matchday to current date
    const now = new Date();
    let closest = uniqueMatchdays[0] || 1;
    let minDiff = Infinity;

    uniqueMatchdays.forEach((md) => {
      const mdMatches = byMatchday[md] || [];
      if (mdMatches.length > 0) {
        // Use the first match's date as representative for the matchday
        const matchDate = new Date(mdMatches[0].utcDate);
        const diff = Math.abs(matchDate.getTime() - now.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closest = md;
        }
      }
    });

    return {
      matchdays: uniqueMatchdays,
      matchdayMatches: byMatchday,
      closestMatchday: closest,
    };
  }, [matches, leagueMatches, format]);

  // Set initial matchday to closest when data loads
  useEffect(() => {
    if (matchdays.length > 0 && selectedMatchday === null) {
      setSelectedMatchday(closestMatchday);
    }
  }, [matchdays, closestMatchday, selectedMatchday]);

  // Reset matchday when competition changes
  useEffect(() => {
    setSelectedMatchday(null);
  }, [id]);

  // Reset tab when competition changes
  useEffect(() => {
    setActiveTab('standings');
  }, [id]);

  // Set initial tab based on competition format
  useEffect(() => {
    if (format === 'knockout') {
      setActiveTab('knockout');
    } else if (format === 'group_knockout' || format === 'group_stage') {
      setActiveTab('standings');
    }
  }, [format]);

  if (loadingCompetition) {
    return <LoadingSpinner message="Loading competition data..." />;
  }

  if (error || !competition) {
    return <ErrorPage notFound />;
  }

  const recentMatches = matches.filter((m) => m.status === 'FINISHED').slice(-5).reverse();

  const getSeasonLabel = () => {
    if (!competition.currentSeason) return '';
    const start = new Date(competition.currentSeason.startDate).getFullYear();
    const end = new Date(competition.currentSeason.endDate).getFullYear();
    const matchday = competition.currentSeason.currentMatchday
      ? ` • Matchday ${competition.currentSeason.currentMatchday}`
      : '';
    return `${start}/${end.toString().slice(-2)} Season${matchday}`;
  };

  const isLeague = format === 'league' || format === 'unknown';
  const hasKnockout = format === 'knockout' || format === 'group_knockout';

  return (
    <div className="competition-page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span>&#8592;</span>
          </button>
          <h1 className="page-title">Competition</h1>
        </div>
        <div className="topbar-right">
          {user && (
            <button
              className="btn-secondary"
              onClick={toggleFavourite}
              disabled={favouriteLoading}
            >
              {isFavourite ? '★ Favorited' : '☆ Add to Favorites'}
            </button>
          )}
          {user ? (
            <Link to="/favorites" className="btn-primary">
              My Favorites
            </Link>
          ) : (
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div className="content">
        {/* Competition Header */}
        <div className="comp-header">
          <div className="comp-emblem">
            {competition.emblem && <img src={competition.emblem} alt={competition.name} />}
          </div>
          <div className="comp-details">
            <h1>{competition.name}</h1>
            <div className="comp-meta">
              <div className="comp-area">
                {competition.area?.flag && (
                  <img src={competition.area.flag} alt={competition.area.name} />
                )}
                {competition.area?.name}
              </div>
              <span className="comp-season">{getSeasonLabel()}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          {(isLeague || format === 'group_knockout' || format === 'group_stage') && (
            <button
              className={`tab-item ${activeTab === 'standings' ? 'active' : ''}`}
              onClick={() => setActiveTab('standings')}
            >
              {format === 'group_knockout' || format === 'group_stage' ? 'Groups' : 'Standings'}
            </button>
          )}
          {hasKnockout && (
            <button
              className={`tab-item ${activeTab === 'knockout' ? 'active' : ''}`}
              onClick={() => setActiveTab('knockout')}
            >
              Knockout
            </button>
          )}
          <button
            className={`tab-item ${activeTab === 'scorers' ? 'active' : ''}`}
            onClick={() => setActiveTab('scorers')}
          >
            Scorers
          </button>
          <button
            className={`tab-item ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </button>
        </div>

        {/* Standings Tab */}
        {activeTab === 'standings' && (
          <div className="page-grid">
            <div>
              {isLeague && <LeagueTable competitionId={id!} />}
              {(format === 'group_knockout' || format === 'group_stage') && standings?.standings && (
                <GroupStage standings={standings.standings} isNationalTeam={disableTeamLinks} />
              )}
            </div>
            {recentMatches.length > 0 && (
              <div className="glass">
                <div className="section-title">Recent Matches</div>
                <div className="match-list-mini">
                  {recentMatches.map((match) => (
                    <Link key={match.id} to={`/matches/${match.id}`} className="match-item-mini">
                      <div className="match-date-mini">
                        {new Date(match.utcDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="match-teams-mini">
                        <div className="match-team-mini">
                          {match.homeTeam.crest && (
                            <img src={match.homeTeam.crest} alt={match.homeTeam.name} />
                          )}
                          <span>{match.homeTeam.shortName || match.homeTeam.name}</span>
                        </div>
                        <div className="match-score-mini">
                          {match.score.fullTime.home} : {match.score.fullTime.away}
                        </div>
                        <div className="match-team-mini away">
                          <span>{match.awayTeam.shortName || match.awayTeam.name}</span>
                          {match.awayTeam.crest && (
                            <img src={match.awayTeam.crest} alt={match.awayTeam.name} />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Knockout Tab */}
        {activeTab === 'knockout' && hasKnockout && (
          <KnockoutBracket matches={knockoutMatches} isNationalTeam={disableTeamLinks} />
        )}

        {/* Scorers Tab */}
        {activeTab === 'scorers' && (
          <div className="glass">
            {scorers.length === 0 ? (
              <p className="empty-state">No scorer data available for this competition</p>
            ) : (
              <div className="scorers-table">
                <div className="scorers-header">
                  <span>#</span>
                  <span>Player</span>
                  <span>Team</span>
                  <span>Played</span>
                  <span>Goals</span>
                  <span>Assists</span>
                  <span>Pen</span>
                </div>
                {scorers.map((scorer, index) => (
                  <div key={scorer.player.id} className="scorers-row">
                    <span className={`scorer-rank ${index < 3 ? 'top' : ''}`}>{index + 1}</span>
                    <div className="scorer-player">
                      <div className="scorer-avatar">&#9917;</div>
                      <div className="scorer-info">
                        <div className="scorer-name">{scorer.player.name}</div>
                        <div className="scorer-meta">
                          {scorer.player.section || scorer.player.position || 'Player'}
                          {scorer.player.nationality && ` • ${scorer.player.nationality}`}
                        </div>
                      </div>
                    </div>
                    <Link to={`/teams/${scorer.team.id}`} className="scorer-team">
                      <div className="scorer-team-crest">
                        {scorer.team.crest && <img src={scorer.team.crest} alt={scorer.team.name} />}
                      </div>
                      <span>{scorer.team.shortName || scorer.team.name}</span>
                    </Link>
                    <span className="scorer-stat">{scorer.playedMatches}</span>
                    <span className="scorer-goals">{scorer.goals}</span>
                    <span className="scorer-stat">{scorer.assists ?? '-'}</span>
                    <span className="scorer-stat">{scorer.penalties ?? '-'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="glass">
            {matchdays.length > 0 ? (
              <>
                <div className="matchday-nav">
                  <button
                    className="matchday-arrow"
                    onClick={() => setSelectedMatchday((prev) => Math.max((prev || 1) - 1, matchdays[0]))}
                    disabled={selectedMatchday === matchdays[0]}
                  >
                    &#8592;
                  </button>
                  <div className="matchday-pills">
                    {(() => {
                      const current = selectedMatchday || matchdays[0];
                      const currentIdx = matchdays.indexOf(current);
                      const total = matchdays.length;
                      const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

                      if (total <= 9) {
                        // Show all if 9 or fewer
                        items.push(...matchdays);
                      } else {
                        // Always show first
                        items.push(matchdays[0]);

                        if (currentIdx > 3) {
                          items.push('ellipsis-start');
                        }

                        // Show range around current
                        const start = Math.max(1, currentIdx - 2);
                        const end = Math.min(total - 2, currentIdx + 2);

                        for (let i = start; i <= end; i++) {
                          if (!items.includes(matchdays[i])) {
                            items.push(matchdays[i]);
                          }
                        }

                        if (currentIdx < total - 4) {
                          items.push('ellipsis-end');
                        }

                        // Always show last
                        if (!items.includes(matchdays[total - 1])) {
                          items.push(matchdays[total - 1]);
                        }
                      }

                      return items.map((item) =>
                        item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                          <span key={item} className="matchday-ellipsis">...</span>
                        ) : (
                          <button
                            key={item}
                            className={`matchday-pill ${item === current ? 'active' : ''}`}
                            onClick={() => setSelectedMatchday(item)}
                          >
                            {item}
                          </button>
                        )
                      );
                    })()}
                  </div>
                  <button
                    className="matchday-arrow"
                    onClick={() => setSelectedMatchday((prev) => Math.min((prev || 1) + 1, matchdays[matchdays.length - 1]))}
                    disabled={selectedMatchday === matchdays[matchdays.length - 1]}
                  >
                    &#8594;
                  </button>
                </div>
                <div className="match-list">
                  {(() => {
                    const mdMatches = matchdayMatches[selectedMatchday || 0] || [];
                    // Group matches by date
                    const byDate: Record<string, Match[]> = {};
                    mdMatches.forEach((m) => {
                      const dateKey = new Date(m.utcDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      });
                      if (!byDate[dateKey]) {
                        byDate[dateKey] = [];
                      }
                      byDate[dateKey].push(m);
                    });

                    // Sort dates chronologically
                    const sortedDates = Object.keys(byDate).sort((a, b) => {
                      const dateA = new Date(byDate[a][0].utcDate);
                      const dateB = new Date(byDate[b][0].utcDate);
                      return dateA.getTime() - dateB.getTime();
                    });

                    return sortedDates.map((dateKey) => (
                      <div key={dateKey} className="matchday-date-group">
                        <div className="matchday-date-header">{dateKey}</div>
                        {byDate[dateKey].map((match) => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </>
            ) : matches.length === 0 ? (
              <p className="empty-state">No matches available</p>
            ) : (
              <div className="match-list">
                {(format === 'group_knockout' || format === 'group_stage'
                  ? leagueMatches
                  : matches
                ).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .competition-page {
          min-height: 100vh;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 16px 32px;
          background: rgba(3, 7, 18, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          cursor: pointer;
          font-size: 18px;
          color: inherit;
        }

        .back-btn:hover {
          background: var(--cyan-bg);
        }

        .page-title {
          font-size: 22px;
          font-weight: 700;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .content {
          padding: 28px 32px;
        }

        .comp-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
        }

        .comp-emblem {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }

        .comp-emblem img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .comp-details h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .comp-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .comp-area {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .comp-area img {
          width: 20px;
          height: 14px;
          object-fit: contain;
        }

        .comp-season {
          font-size: 14px;
          color: var(--text-muted);
        }

        .page-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title::before {
          content: '';
          width: 3px;
          height: 14px;
          background: linear-gradient(180deg, var(--cyan-primary), var(--cyan-secondary));
          border-radius: 2px;
        }

        .match-list-mini {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .match-item-mini {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 10px;
          background: rgba(6, 182, 212, 0.02);
          border: 1px solid rgba(6, 182, 212, 0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }

        .match-item-mini:hover {
          background: rgba(6, 182, 212, 0.05);
        }

        .match-date-mini {
          width: 50px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .match-teams-mini {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .match-team-mini {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .match-team-mini.away {
          justify-content: flex-end;
        }

        .match-team-mini img {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }

        .match-score-mini {
          font-weight: 700;
          font-size: 13px;
          min-width: 40px;
          text-align: center;
        }

        .empty-state {
          color: var(--text-muted);
          font-size: 14px;
          text-align: center;
          padding: 40px;
        }

        .scorers-table {
          width: 100%;
        }

        .scorers-header {
          display: grid;
          grid-template-columns: 40px minmax(200px, 1fr) minmax(140px, 180px) 60px 60px 60px 60px;
          gap: 16px;
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-primary);
        }

        .scorers-header span {
          text-align: center;
        }

        .scorers-header span:nth-child(2) {
          text-align: left;
        }

        .scorers-header span:nth-child(3) {
          text-align: left;
        }

        .scorers-row {
          display: grid;
          grid-template-columns: 40px minmax(200px, 1fr) minmax(140px, 180px) 60px 60px 60px 60px;
          gap: 16px;
          padding: 16px 20px;
          align-items: center;
          border-bottom: 1px solid var(--border-primary);
          transition: all 0.2s ease;
        }

        .scorers-row:hover {
          background: rgba(6, 182, 212, 0.05);
        }

        .scorer-rank {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-muted);
          text-align: center;
        }

        .scorer-rank.top {
          color: #fbbf24;
        }

        .scorer-player {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .scorer-avatar {
          width: 36px;
          height: 36px;
          background: var(--cyan-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .scorer-info {
          flex: 1;
          min-width: 0;
        }

        .scorer-name {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scorer-meta {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scorer-team {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
          min-width: 0;
        }

        .scorer-team:hover {
          color: var(--cyan-light);
        }

        .scorer-team span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scorer-team-crest {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 2px;
        }

        .scorer-team-crest img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .scorer-stat {
          font-size: 14px;
          text-align: center;
          color: var(--text-secondary);
        }

        .scorer-goals {
          font-size: 16px;
          font-weight: 700;
          color: var(--cyan-light);
          text-align: center;
        }

        .match-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .matchday-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-primary);
        }

        .matchday-arrow {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          cursor: pointer;
          font-size: 16px;
          color: inherit;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .matchday-arrow:hover:not(:disabled) {
          background: var(--cyan-bg);
          border-color: var(--cyan-primary);
        }

        .matchday-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .matchday-pills {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .matchday-pill {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          padding: 0 8px;
        }

        .matchday-pill:hover {
          background: var(--cyan-bg);
          border-color: var(--cyan-primary);
          color: var(--text-primary);
        }

        .matchday-pill.active {
          background: var(--cyan-primary);
          border-color: var(--cyan-primary);
          color: #000;
          font-weight: 600;
        }

        .matchday-ellipsis {
          color: var(--text-muted);
          font-size: 14px;
          padding: 0 4px;
        }

        .matchday-date-group {
          margin-bottom: 20px;
        }

        .matchday-date-group:last-child {
          margin-bottom: 0;
        }

        .matchday-date-header {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 12px 0;
          border-bottom: 1px solid var(--border-primary);
          margin-bottom: 8px;
        }

        @media (max-width: 1100px) {
          .page-grid {
            grid-template-columns: 1fr;
          }

          .scorers-header,
          .scorers-row {
            grid-template-columns: 32px minmax(160px, 1fr) minmax(100px, 140px) 50px 50px 50px 50px;
            gap: 12px;
            padding: 12px 16px;
          }
        }

        @media (max-width: 768px) {
          .topbar {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .content {
            padding: 16px;
          }

          .comp-header {
            flex-direction: column;
            text-align: center;
          }

          .comp-meta {
            flex-direction: column;
            gap: 8px;
          }

          .scorers-header,
          .scorers-row {
            grid-template-columns: 28px 1fr 32px 40px 40px;
            gap: 8px;
            font-size: 12px;
          }

          .scorers-header span:nth-child(6),
          .scorers-row span:nth-child(6),
          .scorers-header span:nth-child(7),
          .scorers-row span:nth-child(7) {
            display: none;
          }

          .scorer-team span {
            display: none;
          }

          .scorer-avatar {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompetitionPage;
