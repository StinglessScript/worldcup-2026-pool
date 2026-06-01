import React from 'react';
import { type Match, type Prediction } from '../../services';
import { vi } from '../../i18n';
import { isLive } from '../../utils';
import { MatchCard } from './MatchCard';

type LiveMatchesProps = {
  matches: Record<string, Match>;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: Record<string, Prediction>;
};

export const LiveMatches = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
}: LiveMatchesProps) => {
  // Filter matches that are currently live
  const liveMatches = React.useMemo(() => {
    return Object.values(matches)
      .filter((match) => isLive(match))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [matches]);

  if (liveMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        {vi.match.liveMatches}
        <span className="text-sm font-normal text-white/50">
          ({liveMatches.length})
        </span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {liveMatches.map((match) => (
          <MatchCard
            key={match.game}
            match={match}
            isOwnProfile={isOwnProfile}
            userId={userId}
            prediction={predictions?.[match.game]}
            variant="live"
          />
        ))}
      </div>
    </div>
  );
};
