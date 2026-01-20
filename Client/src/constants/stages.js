/**
 * Match stage constants for knockout and group stages
 */

export const STAGE_ORDER = {
  ROUND_1: 1,
  ROUND_2: 2,
  ROUND_3: 3,
  LAST_64: 4,
  LAST_32: 5,
  LAST_16: 6,
  ROUND_OF_16: 6,
  QUARTER_FINALS: 7,
  SEMI_FINALS: 8,
  THIRD_PLACE: 9,
  FINAL: 10,
};

export const STAGE_LABELS = {
  ROUND_1: 'Qualifying Round 1',
  ROUND_2: 'Qualifying Round 2',
  ROUND_3: 'Qualifying Round 3',
  LAST_64: 'Round of 64',
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS: 'Semi-Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

export const KNOCKOUT_STAGES = [
  'ROUND_1',
  'ROUND_2',
  'ROUND_3',
  'LAST_64',
  'LAST_32',
  'LAST_16',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'FINAL',
];

export const GROUP_STAGES = ['GROUP_STAGE', 'REGULAR_SEASON'];

/**
 * Check if a stage is a knockout stage
 */
export const isKnockoutStage = (stage) => KNOCKOUT_STAGES.includes(stage);

/**
 * Check if a stage is a group stage
 */
export const isGroupStage = (stage) =>
  GROUP_STAGES.includes(stage) || stage?.startsWith('GROUP_');
