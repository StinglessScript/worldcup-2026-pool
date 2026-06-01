import React from 'react';
import { type Match, type Prediction } from '../../services';
import { vi } from '../../i18n';
import { isUpcoming, getTimeUntilCutoff, formatTimeRemaining, getUrgencyLevel } from '../../utils';
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

  // Filter matches in the next 24 hours that haven't been played
  const upcomingMatches = React.useMemo(() => {
    return Object.values(matches)
      .filter((match) => isUpcoming(match))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [matches]);

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
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">⏰</span>
        {vi.match.upcoming}
        <span className="text-sm font-normal text-white/50">
          ({upcomingMatches.length} {vi.match.matches})
        </span>
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

  // Determine colors based on urgency
  const colorMap = {
    green: { bar: 'bg-green-500', bg: 'bg-green-900/30', text: 'text-green-400' },
    yellow: { bar: 'bg-yellow-500', bg: 'bg-yellow-900/30', text: 'text-yellow-400' },
    red: { bar: 'bg-red-500', bg: 'bg-red-900/30', text: 'text-red-400' },
    closed: { bar: 'bg-red-500', bg: 'bg-red-900/30', text: 'text-red-400' },
  };

  const colors = colorMap[urgency];

  return (
    <div className={`${colors.bg} rounded-lg p-2`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${colors.text}`}>
          {isClosed ? '🔒 Đã đóng' : '⏳ Còn lại'}
        </span>
        <span className={`text-xs font-bold ${colors.text}`}>
          {timeLeft}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className={`${colors.bar} h-1.5 rounded-full transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
