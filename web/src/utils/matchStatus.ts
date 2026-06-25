import { type Match } from '../services';

// Estimated match duration; a match is considered "live" within this window
// from kickoff. We rely on time (not score) because the FIFA feed sets a score
// while a match is still in progress, so score alone can't separate
// live-with-current-score from finished.
const MATCH_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Check if a match is currently live (being played)
 * True when now is within the [kickoff, kickoff + 3h] window
 */
export const isLive = (match: Match): boolean => {
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  return now >= kickoffTime && now < kickoffTime + MATCH_DURATION_MS;
};

/**
 * Check if a match has finished (past the estimated end of the live window)
 */
export const isFinished = (match: Match): boolean => {
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  return now >= kickoffTime + MATCH_DURATION_MS;
};

/**
 * Check if a match is upcoming (kickoff is still in the future)
 */
export const isUpcoming = (match: Match): boolean => {
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
