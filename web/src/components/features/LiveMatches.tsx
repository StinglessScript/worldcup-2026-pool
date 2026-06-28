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
    <div className="mb-6">
      <h2 className="text-sm font-medium text-white/50 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
        {vi.match.liveMatches}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {liveMatches.map((match) => (
          <div key={match.game} className="flex flex-col gap-2">
            <MatchCard
              match={match}
              isOwnProfile={isOwnProfile}
              userId={userId}
              prediction={predictions?.[match.game]}
              predictions={predictions}
              variant="live"
            />

            {/* Live indicator bar - same style as countdown bar */}
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="text-green-400 font-medium">{vi.match.live}</span>
              <div className="flex-1 bg-white/10 rounded-full h-1">
                <div className="h-1 rounded-full bg-green-400 animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
