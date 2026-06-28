import React from 'react';
import { type Match, type Prediction } from '../../services';
import { vi } from '../../i18n';
import { isRecent } from '../../utils';
import { MatchCard } from './MatchCard';

type RecentResultsProps = {
  matches: Record<string, Match>;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: Record<string, Prediction>;
};

export const RecentResults = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
}: RecentResultsProps) => {
  // Filter matches that were recently finished (within 24 hours)
  const recentMatches = React.useMemo(() => {
    return Object.values(matches)
      .filter((match) => isRecent(match))
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  }, [matches]);

  if (recentMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
        {vi.match.recentResults}
        <span className="text-sm text-white/40">({recentMatches.length})</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {recentMatches.map((match) => (
          <MatchCard
            key={match.game}
            match={match}
            isOwnProfile={isOwnProfile}
            userId={userId}
            prediction={predictions?.[match.game]}
            predictions={predictions}
            variant="recent"
          />
        ))}
      </div>
    </div>
  );
};
