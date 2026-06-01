import React from 'react';
import { type Match, type Prediction } from '../../services';
import { vi } from '../../i18n';
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
    const now = Date.now();
    const in24Hours = now + 24 * 60 * 60 * 1000;

    return Object.values(matches)
      .filter((match) => {
        const kickoffTime = match.timestamp * 1000;
        const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
        return !isPlayed && kickoffTime > now && kickoffTime <= in24Hours;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [matches]);

  // Update countdown timers every second
  React.useEffect(() => {
    const updateCountdowns = () => {
      const now = Date.now();
      const newCountdowns: Record<string, string> = {};

      upcomingMatches.forEach((match) => {
        const cutoffTime = match.timestamp * 1000 - 10 * 60 * 1000; // 10 mins before kickoff
        const timeLeft = cutoffTime - now;

        if (timeLeft <= 0) {
          newCountdowns[match.game] = vi.match.closed;
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          if (hours > 0) {
            newCountdowns[match.game] = `${hours}h ${minutes}m`;
          } else if (minutes > 0) {
            newCountdowns[match.game] = `${minutes}m ${seconds}s`;
          } else {
            newCountdowns[match.game] = `${seconds}s`;
          }
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
  const now = Date.now();
  const cutoffTime = match.timestamp * 1000 - 10 * 60 * 1000;
  const timeLeftMs = cutoffTime - now;
  const totalTime = 24 * 60 * 60 * 1000; // 24 hours max
  const progress = Math.max(0, Math.min(100, ((totalTime - timeLeftMs) / totalTime) * 100));

  // Determine urgency level
  let barColor = 'bg-green-500'; // > 1 hour
  let bgColor = 'bg-green-900/30';
  let textColor = 'text-green-400';

  if (timeLeftMs <= 0) {
    barColor = 'bg-red-500';
    bgColor = 'bg-red-900/30';
    textColor = 'text-red-400';
  } else if (timeLeftMs <= 30 * 60 * 1000) {
    barColor = 'bg-red-500';
    bgColor = 'bg-red-900/30';
    textColor = 'text-red-400';
  } else if (timeLeftMs <= 60 * 60 * 1000) {
    barColor = 'bg-yellow-500';
    bgColor = 'bg-yellow-900/30';
    textColor = 'text-yellow-400';
  }

  return (
    <div className={`${bgColor} rounded-lg p-2`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${textColor}`}>
          {isClosed ? '🔒 Đã đóng' : '⏳ Còn lại'}
        </span>
        <span className={`text-xs font-bold ${textColor}`}>
          {timeLeft}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className={`${barColor} h-1.5 rounded-full transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
