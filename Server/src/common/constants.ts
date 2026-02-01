/**
 * Data fetching status - used across services for cache/API responses
 */
export const DataStatus = {
  FRESH: 'fresh',
  STALE: 'stale',
  PROCESSING: 'processing',
} as const;

export type DataStatusType = (typeof DataStatus)[keyof typeof DataStatus];

/**
 * BullMQ job states for queue management
 */
export const JobState = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  DELAYED: 'delayed',
} as const;

export type JobStateType = (typeof JobState)[keyof typeof JobState];

/**
 * Default values for retry/timeout behavior
 */
export const Defaults = {
  RETRY_AFTER_SECONDS: 5,
  RATE_LIMIT_RETRY_SECONDS: 60,
} as const;
