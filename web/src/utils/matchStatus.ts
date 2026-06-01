import { type Match } from '../services';

/**
 * Check if a match is currently live (being played)
 * Uses a 3-hour window from kickoff time
 */
export const isLive = (match: Match): boolean => {
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  const matchEndEstimate = kickoffTime + 3 * 60 * 60 * 1000; // 3 hours after kickoff
  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;

  return !isPlayed && now >= kickoffTime && now < matchEndEstimate;
};

/**
 * Check if a match is upcoming (not yet played, within 24 hours)
 */
export const isUpcoming = (match: Match): boolean => {
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  const in24Hours = now + 24 * 60 * 60 * 1000;
  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;

  return !isPlayed && kickoffTime > now && kickoffTime <= in24Hours;
};

/**
 * Check if a match was recently finished (within 24 hours)
 */
export const isRecent = (match: Match): boolean => {
  const now = Date.now();
  const kickoffTime = match.timestamp * 1000;
  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;

  // Match finished within last 24 hours
  return isPlayed && kickoffTime > now - 24 * 60 * 60 * 1000;
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

  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
  if (isPlayed) return 'finished';

  return 'scheduled';
};
