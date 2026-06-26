import { type Match } from '../services';

// Estimated match duration; used only as a fallback for records that predate
// the persisted FIFA `matchStatus` field. A match is considered "live" within
// this window from kickoff. We rely on time (not score) here because the FIFA
// feed sets a score while a match is still in progress, so score alone can't
// separate live-with-current-score from finished.
const MATCH_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

// FIFA `matchStatus` values. There is no official documentation for these;
// they were verified against the live feed (0 = finished/full time,
// 1 = not started, 3 = live/in play). When the field is present we trust it,
// since it clears the live tab the moment the feed reports full time instead
// of waiting out a fixed time window.
const FIFA_STATUS_FINISHED = 0;
const FIFA_STATUS_LIVE = 3;

/**
 * Check if a match is currently live (being played).
 * Uses the FIFA status when available, else the [kickoff, kickoff + 3h] window.
 */
export const isLive = (match: Match): boolean => {
  if (typeof match.matchStatus === 'number') {
    return match.matchStatus === FIFA_STATUS_LIVE;
  }
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  return now >= kickoffTime && now < kickoffTime + MATCH_DURATION_MS;
};

/**
 * Check if a match has finished.
 * Uses the FIFA status when available, else the end of the time window.
 */
export const isFinished = (match: Match): boolean => {
  if (typeof match.matchStatus === 'number') {
    return match.matchStatus === FIFA_STATUS_FINISHED;
  }
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  return now >= kickoffTime + MATCH_DURATION_MS;
};

/**
 * Check if a match is upcoming (not started yet).
 * Uses the FIFA status when available, else whether kickoff is in the future.
 */
export const isUpcoming = (match: Match): boolean => {
  if (typeof match.matchStatus === 'number') {
    return (
      match.matchStatus !== FIFA_STATUS_FINISHED &&
      match.matchStatus !== FIFA_STATUS_LIVE
    );
  }
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  return kickoffTime > now;
};

/**
 * Check if a match was recently finished (within last 24 hours)
 */
export const isRecent = (match: Match): boolean => {
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  // Finished and kicked off within the last 24 hours
  return isFinished(match) && kickoffTime > now - 24 * 60 * 60 * 1000;
};

/**
 * Get time remaining until prediction cutoff (10 minutes before kickoff)
 * Returns null if already past cutoff
 */
export const getTimeUntilCutoff = (match: Match): number | null => {
  const now = Date.now();
  const cutoffTime = match.timestamp * 1000 - 10 * 60 * 1000; // 10 mins before kickoff
  const timeLeft = cutoffTime - now;

  return timeLeft > 0 ? timeLeft : null;
};

/**
 * Format time remaining as human-readable string
 */
export const formatTimeRemaining = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Get urgency level for countdown display
 */
export const getUrgencyLevel = (ms: number): 'green' | 'yellow' | 'red' | 'closed' => {
  if (ms <= 0) return 'closed';
  if (ms <= 30 * 60 * 1000) return 'red'; // < 30 mins
  if (ms <= 60 * 60 * 1000) return 'yellow'; // < 1 hour
  return 'green'; // > 1 hour
};

/**
 * Get match status for display
 */
export type MatchStatus = 'live' | 'upcoming' | 'recent' | 'finished' | 'scheduled';

export const getMatchStatus = (match: Match): MatchStatus => {
  if (isLive(match)) return 'live';
  if (isUpcoming(match)) return 'upcoming';
  if (isRecent(match)) return 'recent';
  if (isFinished(match)) return 'finished';

  return 'scheduled';
};
