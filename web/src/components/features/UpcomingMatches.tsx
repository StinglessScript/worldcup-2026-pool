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
          <div key={match.game} className="relative">
            <MatchCard
              match={match}
              isOwnProfile={isOwnProfile}
              userId={userId}
              prediction={predictions?.[match.game]}
            />

            {/* Countdown overlay */}
            {countdown[match.game] && (
              <div className="absolute top-2 right-2">
                <CountdownBadge
                  timeLeft={countdown[match.game]}
                  isClosed={countdown[match.game] === vi.match.closed}
                  match={match}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

type CountdownBadgeProps = {
  timeLeft: string;
  isClosed: boolean;
  match: Match;
};

const CountdownBadge = ({ timeLeft, isClosed, match }: CountdownBadgeProps) => {
  const now = Date.now();
  const cutoffTime = match.timestamp * 1000 - 10 * 60 * 1000;
  const timeLeftMs = cutoffTime - now;

  // Determine urgency level
  let urgencyClass = 'bg-green-600/80 text-green-100'; // > 1 hour
  if (timeLeftMs <= 0) {
    urgencyClass = 'bg-red-600/80 text-red-100'; // Closed
  } else if (timeLeftMs <= 30 * 60 * 1000) {
    urgencyClass = 'bg-red-600/80 text-red-100 animate-pulse'; // < 30 mins
  } else if (timeLeftMs <= 60 * 60 * 1000) {
    urgencyClass = 'bg-yellow-600/80 text-yellow-100'; // < 1 hour
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-bold ${urgencyClass}`}
    >
      {isClosed ? '🔒' : '⏳'} {timeLeft}
    </span>
  );
};
