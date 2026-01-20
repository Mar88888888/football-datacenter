import { Link } from 'react-router-dom';
import { STAGE_ORDER, STAGE_LABELS } from '../constants';

const TeamDisplay = ({ team, isWinner, result, isNationalTeam }) => {
  const content = (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0">
        {team?.crest && (
          <img
            src={team.crest}
            alt={team.shortName || team.name}
            className="w-8 h-8 object-contain"
          />
        )}
      </div>
      <span
        className={`font-medium truncate ${
          isWinner ? 'text-white' : 'text-slate-300'
        }`}
      >
        {team?.shortName || team?.name || 'TBD'}
      </span>
    </div>
  );

  if (isNationalTeam || !team?.id) {
    return (
      <div className="flex items-center gap-3 flex-1 min-w-0">{content}</div>
    );
  }

  return (
    <Link
      to={`/teams/${team.id}`}
      className="hover:opacity-80 transition-opacity"
    >
      {content}
    </Link>
  );
};

const KnockoutBracket = ({ matches, isNationalTeam = false }) => {
  const knockoutMatches = matches.filter(
    (match) => match.stage && STAGE_ORDER[match.stage]
  );

  if (knockoutMatches.length === 0) {
    return null;
  }

  const matchesByStage = knockoutMatches.reduce((acc, match) => {
    const stage = match.stage;
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(match);
    return acc;
  }, {});

  const sortedStages = Object.keys(matchesByStage).sort(
    (a, b) => (STAGE_ORDER[a] || 99) - (STAGE_ORDER[b] || 99)
  );

  const formatDate = (utcDate) => {
    const date = new Date(utcDate);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const getMatchResult = (match) => {
    if (match.status === 'SCHEDULED' || match.status === 'TIMED') {
      return null;
    }
    return {
      home: match.score?.fullTime?.home ?? 0,
      away: match.score?.fullTime?.away ?? 0,
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <h3 className="text-2xl font-bold text-white text-center mb-6">
        Knockout Stage
      </h3>

      <div className="space-y-8">
        {sortedStages.map((stage) => (
          <div key={stage}>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-slate-700 flex-1"></div>
              <h4 className="text-lg font-semibold text-slate-300 uppercase tracking-wider">
                {STAGE_LABELS[stage] || stage.replace(/_/g, ' ')}
              </h4>
              <div className="h-px bg-slate-700 flex-1"></div>
            </div>

            <div
              className={`grid gap-4 ${
                stage === 'FINAL' || stage === 'THIRD_PLACE'
                  ? 'grid-cols-1 max-w-lg mx-auto'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {matchesByStage[stage]
                .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
                .map((match) => {
                  const result = getMatchResult(match);
                  const homeWon = result && result.home > result.away;
                  const awayWon = result && result.away > result.home;

                  return (
                    <div
                      key={match.id}
                      className={`bg-slate-800 rounded-xl border overflow-hidden shadow-lg ${
                        stage === 'FINAL'
                          ? 'border-yellow-500/50'
                          : 'border-slate-700'
                      }`}
                    >
                      <div className="bg-slate-900/50 px-4 py-2 text-center border-b border-slate-700/50">
                        <span className="text-xs text-slate-400">
                          {formatDate(match.utcDate)}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <div
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            homeWon ? 'bg-green-900/30' : ''
                          }`}
                        >
                          <TeamDisplay
                            team={match.homeTeam}
                            isWinner={homeWon}
                            isNationalTeam={isNationalTeam}
                          />
                          <span
                            className={`text-2xl font-bold min-w-[2rem] text-center ${
                              homeWon
                                ? 'text-green-400'
                                : result
                                ? 'text-slate-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {result ? result.home : '-'}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            awayWon ? 'bg-green-900/30' : ''
                          }`}
                        >
                          <TeamDisplay
                            team={match.awayTeam}
                            isWinner={awayWon}
                            isNationalTeam={isNationalTeam}
                          />
                          <span
                            className={`text-2xl font-bold min-w-[2rem] text-center ${
                              awayWon
                                ? 'text-green-400'
                                : result
                                ? 'text-slate-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {result ? result.away : '-'}
                          </span>
                        </div>
                      </div>

                      {match.status === 'FINISHED' && (
                        <div className="bg-slate-900/30 px-4 py-2 text-center border-t border-slate-700/50">
                          <span className="text-xs text-green-400 font-medium">
                            Full Time
                          </span>
                        </div>
                      )}
                      {(match.status === 'IN_PLAY' ||
                        match.status === 'PAUSED') && (
                        <div className="bg-yellow-900/30 px-4 py-2 text-center border-t border-yellow-700/50">
                          <span className="text-xs text-yellow-400 font-medium animate-pulse">
                            Live
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnockoutBracket;
