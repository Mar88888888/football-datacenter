import React from 'react';
import { Link } from 'react-router-dom';
import { STAGE_ORDER, STAGE_LABELS } from '../constants';
import type { Match, TeamMinimal } from '../types';
import './KnockoutBracket.css';

interface KnockoutBracketProps {
  matches: Match[];
  isNationalTeam?: boolean;
}

// A "Tie" represents a knockout round matchup (can be 1 or 2 legs)
interface Tie {
  id: string;
  stage: string;
  matches: Match[];
  homeTeam: TeamMinimal;
  awayTeam: TeamMinimal;
  // Aggregate score across all legs
  homeAggregate: number | null;
  awayAggregate: number | null;
  isComplete: boolean;
  firstLegDate: string;
}

const formatDate = (utcDate: string): string => {
  const date = new Date(utcDate);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

// Group matches into ties (combining both legs of a two-legged knockout round)
function groupMatchesIntoTies(matches: Match[]): Tie[] {
  const tieMap = new Map<string, Match[]>();
  // Collect TBD matches separately for proper pairing
  const tbdByStage = new Map<string, { leg1: Match[]; leg2: Match[] }>();

  for (const match of matches) {
    if (!match.stage) continue;

    const team1Id = match.homeTeam?.id || 0;
    const team2Id = match.awayTeam?.id || 0;

    if (team1Id === 0 && team2Id === 0) {
      // TBD match - collect for later pairing by matchday
      if (!tbdByStage.has(match.stage)) {
        tbdByStage.set(match.stage, { leg1: [], leg2: [] });
      }
      const stageData = tbdByStage.get(match.stage)!;
      // matchday 1 = first leg, matchday 2 = second leg, null = single match (final)
      if (match.matchday === 2) {
        stageData.leg2.push(match);
      } else {
        stageData.leg1.push(match);
      }
    } else {
      // Known teams - group by sorted team IDs
      const teamKey = [team1Id, team2Id].sort((a, b) => a - b).join('-');
      const tieKey = `${match.stage}-${teamKey}`;
      if (!tieMap.has(tieKey)) {
        tieMap.set(tieKey, []);
      }
      tieMap.get(tieKey)!.push(match);
    }
  }

  // Pair TBD matches: match leg 1 with leg 2 by order (sorted by date/id)
  for (const [stage, { leg1, leg2 }] of tbdByStage) {
    // Sort by date, then by id for consistent ordering
    const sortByDateAndId = (a: Match, b: Match) => {
      const dateDiff = new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
      return dateDiff !== 0 ? dateDiff : a.id - b.id;
    };
    leg1.sort(sortByDateAndId);
    leg2.sort(sortByDateAndId);

    // Create ties by pairing leg1[i] with leg2[i]
    for (let i = 0; i < leg1.length; i++) {
      const match1 = leg1[i];
      const match2 = leg2[i]; // May be undefined for single-leg ties (FINAL)
      const tieKey = `${stage}-tbd-${i}`;
      const tieMatches = match2 ? [match1, match2] : [match1];
      tieMap.set(tieKey, tieMatches);
    }
  }

  const ties: Tie[] = [];

  for (const [key, tieMatches] of tieMap) {
    // Sort matches by date (leg 1 first)
    tieMatches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    const firstMatch = tieMatches[0];

    // Calculate aggregate score
    let homeAggregate: number | null = null;
    let awayAggregate: number | null = null;
    let isComplete = true;

    // Determine the "home" team for the tie (team that was home in first leg)
    const tieHomeTeam = firstMatch.homeTeam;
    const tieAwayTeam = firstMatch.awayTeam;

    for (const m of tieMatches) {
      if (m.status === 'SCHEDULED' || m.status === 'TIMED') {
        isComplete = false;
      } else {
        const homeScore = m.score?.fullTime?.home ?? 0;
        const awayScore = m.score?.fullTime?.away ?? 0;

        // Add to correct aggregate based on which team was home in this leg
        if (m.homeTeam?.id === tieHomeTeam?.id) {
          homeAggregate = (homeAggregate ?? 0) + homeScore;
          awayAggregate = (awayAggregate ?? 0) + awayScore;
        } else {
          // Teams swapped (second leg)
          homeAggregate = (homeAggregate ?? 0) + awayScore;
          awayAggregate = (awayAggregate ?? 0) + homeScore;
        }
      }
    }

    ties.push({
      id: key,
      stage: firstMatch.stage!,
      matches: tieMatches,
      homeTeam: tieHomeTeam,
      awayTeam: tieAwayTeam,
      homeAggregate: isComplete ? homeAggregate : null,
      awayAggregate: isComplete ? awayAggregate : null,
      isComplete,
      firstLegDate: firstMatch.utcDate,
    });
  }

  return ties;
}

interface BracketTieProps {
  tie: Tie;
  isNationalTeam: boolean;
  isFinal?: boolean;
}

interface LegScore {
  homeGoals: number | null;
  awayGoals: number | null;
  date: string;
  isPlayed: boolean;
}

const BracketTie: React.FC<BracketTieProps> = ({ tie, isNationalTeam, isFinal }) => {
  const homeWon = tie.isComplete && tie.homeAggregate !== null && tie.awayAggregate !== null
    && tie.homeAggregate > tie.awayAggregate;
  const awayWon = tie.isComplete && tie.homeAggregate !== null && tie.awayAggregate !== null
    && tie.awayAggregate > tie.homeAggregate;
  const isLive = tie.matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const legCount = tie.matches.length;
  const hasTwoLegs = legCount === 2;

  // Calculate each team's goals per leg
  const legScores: LegScore[] = tie.matches.map((m) => {
    const isPlayed = m.status !== 'SCHEDULED' && m.status !== 'TIMED';
    // Check if tie home team was home in this match
    const tieHomeWasMatchHome = m.homeTeam?.id === tie.homeTeam?.id;

    if (!isPlayed) {
      return { homeGoals: null, awayGoals: null, date: m.utcDate, isPlayed: false };
    }

    const matchHomeGoals = m.score?.fullTime?.home ?? 0;
    const matchAwayGoals = m.score?.fullTime?.away ?? 0;

    return {
      homeGoals: tieHomeWasMatchHome ? matchHomeGoals : matchAwayGoals,
      awayGoals: tieHomeWasMatchHome ? matchAwayGoals : matchHomeGoals,
      date: m.utcDate,
      isPlayed: true,
    };
  });

  const TeamRow: React.FC<{ team: TeamMinimal; isWinner: boolean; legScores: LegScore[]; isHome: boolean }> = ({
    team,
    isWinner,
    legScores: scores,
    isHome,
  }) => {
    const content = (
      <>
        <div className={`team-indicator ${isWinner ? 'winner' : ''}`}></div>
        <div className="team-crest">
          {team?.crest ? (
            <img src={team.crest} alt={team.tla || team.shortName || ''} />
          ) : (
            team?.tla || '?'
          )}
        </div>
        <span className={`team-name ${isWinner ? 'winner' : ''}`}>
          {team?.shortName || team?.name || 'TBD'}
        </span>
        <div className="team-scores">
          {scores.map((leg, idx) => (
            <Link
              key={idx}
              to={`/matches/${tie.matches[idx].id}`}
              className={`team-score ${isWinner ? 'winner' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {leg.isPlayed ? (isHome ? leg.homeGoals : leg.awayGoals) : '-'}
            </Link>
          ))}
        </div>
      </>
    );

    if (isNationalTeam || !team?.id) {
      return <div className={`match-team ${isWinner ? 'winner' : ''}`}>{content}</div>;
    }

    return (
      <Link
        to={`/teams/${team.id}`}
        className={`match-team ${isWinner ? 'winner' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className={`bracket-match ${isFinal ? 'final-match' : ''} ${hasTwoLegs ? 'two-legs' : ''}`}>
      <div className="match-header">
        {isLive ? (
          <span className="match-live">Live</span>
        ) : hasTwoLegs ? (
          <>
            <Link to={`/matches/${tie.matches[0].id}`} className="match-date-link">
              {formatDate(legScores[0].date)}
            </Link>
            <Link to={`/matches/${tie.matches[1].id}`} className="match-date-link">
              {formatDate(legScores[1].date)}
            </Link>
          </>
        ) : (
          <Link to={`/matches/${tie.matches[0].id}`} className="match-date-link">
            {formatDate(tie.firstLegDate)}
          </Link>
        )}
      </div>
      <TeamRow
        team={tie.homeTeam}
        isWinner={homeWon}
        legScores={legScores}
        isHome={true}
      />
      <TeamRow
        team={tie.awayTeam}
        isWinner={awayWon}
        legScores={legScores}
        isHome={false}
      />
    </div>
  );
};

const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ matches, isNationalTeam = false }) => {
  const knockoutMatches = matches.filter((match) => match.stage && STAGE_ORDER[match.stage]);

  if (knockoutMatches.length === 0) {
    return null;
  }

  // Group matches into ties
  const ties = groupMatchesIntoTies(knockoutMatches);

  // Group ties by stage
  const tiesByStage = ties.reduce<Record<string, Tie[]>>((acc, tie) => {
    if (!acc[tie.stage]) {
      acc[tie.stage] = [];
    }
    acc[tie.stage].push(tie);
    return acc;
  }, {});

  const availableStages = Object.keys(tiesByStage);
  const hasPlayoffs = availableStages.includes('PLAYOFFS');
  const hasR16 = availableStages.includes('LAST_16') || availableStages.includes('ROUND_OF_16');
  const hasQF = availableStages.includes('QUARTER_FINALS');
  const hasSF = availableStages.includes('SEMI_FINALS');
  const hasFinal = availableStages.includes('FINAL');

  // For proper bracket, need at least SF + Final
  const canShowBracket = hasSF && hasFinal;

  if (!canShowBracket) {
    return <SimpleBracketView ties={ties} tiesByStage={tiesByStage} isNationalTeam={isNationalTeam} />;
  }

  // Build stages in order
  const bracketStages: { stage: string; ties: Tie[] }[] = [];

  if (hasPlayoffs) {
    bracketStages.push({ stage: 'PLAYOFFS', ties: sortTiesByDate(tiesByStage['PLAYOFFS']) });
  }
  if (hasR16) {
    const r16Ties = tiesByStage['LAST_16'] || tiesByStage['ROUND_OF_16'] || [];
    if (r16Ties.length > 0) {
      bracketStages.push({ stage: 'LAST_16', ties: sortTiesByDate(r16Ties) });
    }
  }
  if (hasQF) {
    bracketStages.push({ stage: 'QUARTER_FINALS', ties: sortTiesByDate(tiesByStage['QUARTER_FINALS']) });
  }
  if (hasSF) {
    bracketStages.push({ stage: 'SEMI_FINALS', ties: sortTiesByDate(tiesByStage['SEMI_FINALS']) });
  }
  if (hasFinal) {
    bracketStages.push({ stage: 'FINAL', ties: tiesByStage['FINAL'] });
  }

  return (
    <div className="knockout-bracket-container">
      <h3 className="bracket-title">Knockout Stage</h3>

      <div className="bracket">
        {bracketStages.map(({ stage, ties: stageTies }) => {
          const isPlayoffs = stage === 'PLAYOFFS';
          const isR16 = stage === 'LAST_16' || stage === 'ROUND_OF_16';
          const isQF = stage === 'QUARTER_FINALS';
          const isSF = stage === 'SEMI_FINALS';
          const isFinalStage = stage === 'FINAL';

          let roundClass = 'round';
          if (isPlayoffs) roundClass += ' round-playoffs';
          if (isR16) roundClass += ' round-r16';
          if (isQF) roundClass += ' round-qf';
          if (isSF) roundClass += ' round-sf';
          if (isFinalStage) roundClass += ' round-final';

          return (
            <div key={stage} className={roundClass}>
              <div className={`round-title ${isFinalStage ? 'final' : ''}`}>
                {STAGE_LABELS[stage] || stage.replace(/_/g, ' ')}
              </div>
              <div className="matches">
                {stageTies.map((tie) => (
                  <div key={tie.id} className="match-slot">
                    <BracketTie
                      tie={tie}
                      isNationalTeam={isNationalTeam}
                      isFinal={isFinalStage}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function sortTiesByDate(ties: Tie[]): Tie[] {
  return [...ties].sort((a, b) => new Date(a.firstLegDate).getTime() - new Date(b.firstLegDate).getTime());
}

// Fallback simple view
const SimpleBracketView: React.FC<{
  ties: Tie[];
  tiesByStage: Record<string, Tie[]>;
  isNationalTeam: boolean
}> = ({ tiesByStage, isNationalTeam }) => {
  const sortedStages = Object.keys(tiesByStage).sort(
    (a, b) => (STAGE_ORDER[a] || 99) - (STAGE_ORDER[b] || 99)
  );

  return (
    <div className="knockout-bracket-container simple">
      <h3 className="bracket-title">Knockout Stage</h3>
      <div className="simple-bracket">
        {sortedStages.map((stage) => (
          <div key={stage} className="simple-stage">
            <div className="simple-stage-header">
              <div className="stage-line"></div>
              <h4>{STAGE_LABELS[stage] || stage.replace(/_/g, ' ')}</h4>
              <div className="stage-line"></div>
            </div>
            <div className="simple-matches">
              {sortTiesByDate(tiesByStage[stage]).map((tie) => (
                <BracketTie key={tie.id} tie={tie} isNationalTeam={isNationalTeam} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnockoutBracket;
