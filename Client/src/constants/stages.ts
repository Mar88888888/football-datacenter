/**
 * Match stage constants for knockout and group stages
 */

export const STAGE_ORDER: Record<string, number> = {
  ROUND_1: 1,
  ROUND_2: 2,
  ROUND_3: 3,
  PLAYOFFS: 4,  // UCL knockout playoffs (new format)
  LAST_64: 5,
  LAST_32: 6,
  LAST_16: 7,
  ROUND_OF_16: 7,
  QUARTER_FINALS: 8,
  SEMI_FINALS: 9,
  THIRD_PLACE: 10,
  FINAL: 11,
};

export const STAGE_LABELS: Record<string, string> = {
  ROUND_1: 'Qualifying Round 1',
  ROUND_2: 'Qualifying Round 2',
  ROUND_3: 'Qualifying Round 3',
  PLAYOFFS: 'Playoffs',
  LAST_64: 'Round of 64',
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS: 'Semi-Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

export const KNOCKOUT_STAGES: string[] = [
  'ROUND_1',
  'ROUND_2',
  'ROUND_3',
  'PLAYOFFS',
  'LAST_64',
  'LAST_32',
  'LAST_16',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'FINAL',
];

export const GROUP_STAGES: string[] = ['GROUP_STAGE', 'REGULAR_SEASON'];

/**
 * Check if a stage is a knockout stage
 */
export const isKnockoutStage = (stage: string | undefined | null): boolean =>
  stage ? KNOCKOUT_STAGES.includes(stage) : false;

/**
 * Check if a stage is a group stage
 */
export const isGroupStage = (stage: string | undefined | null): boolean =>
  GROUP_STAGES.includes(stage || '') || (stage?.startsWith('GROUP_') ?? false);
