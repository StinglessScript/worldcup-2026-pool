import React from 'react';
import { type Match, type Prediction } from '../../services';
import { vi } from '../../i18n';
import { getTimeUntilCutoff, formatTimeRemaining, getUrgencyLevel } from '../../utils';
import { MatchCard } from './MatchCard';

type UpcomingMatchesProps = {
  matches: Record<string, Match>;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: Record<string, Prediction>;
};

export const UpcomingMatches = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
}: UpcomingMatchesProps) => {
  const [countdown, setCountdown] = React.useState<Record<string, string>>({});

  // Filter only the NEXT upcoming match
  const nextMatch = React.useMemo(() => {
    const now = Date.now();
    return Object.values(matches)
      .filter((match) => {
        const kickoffTime = match.timestamp * 1000;
        const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
        return !isPlayed && kickoffTime > now;
      })
      .sort((a, b) => a.timestamp - b.timestamp)[0]; // Get only the first one
  }, [matches]);

  const upcomingMatches = nextMatch ? [nextMatch] : [];

  // Update countdown timers every second
  React.useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {};

      upcomingMatches.forEach((match) => {
        const timeLeft = getTimeUntilCutoff(match);

        if (timeLeft === null) {
          newCountdowns[match.game] = vi.match.closed;
        } else {
          newCountdowns[match.game] = formatTimeRemaining(timeLeft);
        }
      });

      setCountdown(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [upcomingMatches]);

  if (upcomingMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
        {vi.match.upcoming}
        <span className="text-sm text-white/40">({upcomingMatches.length})</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {upcomingMatches.map((match) => (
          <div key={match.game} className="flex flex-col gap-2">
            <MatchCard
              match={match}
              isOwnProfile={isOwnProfile}
              userId={userId}
              prediction={predictions?.[match.game]}
              variant="upcoming"
            />

            {/* Countdown bar below match card */}
            {countdown[match.game] && (
              <CountdownBar
                timeLeft={countdown[match.game]}
                isClosed={countdown[match.game] === vi.match.closed}
                match={match}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

type CountdownBarProps = {
  timeLeft: string;
  isClosed: boolean;
  match: Match;
};

const CountdownBar = ({ timeLeft, isClosed, match }: CountdownBarProps) => {
  const timeLeftMs = getTimeUntilCutoff(match) ?? 0;
  const totalTime = 24 * 60 * 60 * 1000; // 24 hours max
  const progress = Math.max(0, Math.min(100, ((totalTime - timeLeftMs) / totalTime) * 100));
  const urgency = getUrgencyLevel(timeLeftMs);

  // Simple color scheme
  const isUrgent = urgency === 'red' || urgency === 'closed';

  return (
    <div className="flex items-center gap-2 text-xs text-white/50">
      {isClosed ? (
        <span className="text-red-400">Đã đóng</span>
      ) : (
        <>
          <span>Còn lại</span>
          <span className="font-medium text-white/70">{timeLeft}</span>
        </>
      )}
      <div className="flex-1 bg-white/10 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-400' : 'bg-white/30'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
