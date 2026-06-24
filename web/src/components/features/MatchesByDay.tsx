import React from 'react';
import {
  type Match,
  type MatchesData,
  type UserPredictions,
} from '../../services';
import { isLive } from '../../utils';
import { MatchCard } from './MatchCard';

type MatchesByDayProps = {
  matches: MatchesData;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: UserPredictions;
  excludeLive?: boolean;
  excludeNextMatch?: boolean;
};

export const MatchesByDay = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
  excludeLive = false,
  excludeNextMatch = false,
}: MatchesByDayProps) => {
  // Filter matches based on exclusions
  const filteredMatches = React.useMemo(() => {
    const now = Date.now();
    let matchList = Object.values(matches);

    // Exclude live matches if requested
    if (excludeLive) {
      matchList = matchList.filter((match) => !isLive(match));
    }

    // Exclude the next upcoming match if requested
    if (excludeNextMatch) {
      const nextMatch = matchList
        .filter((match) => {
          const kickoffTime = match.timestamp * 1000;
          const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
          return !isPlayed && kickoffTime > now;
        })
        .sort((a, b) => a.timestamp - b.timestamp)[0];

      if (nextMatch) {
        matchList = matchList.filter((match) => match.game !== nextMatch.game);
      }
    }

    return matchList;
  }, [matches, excludeLive, excludeNextMatch]);

  // Group matches by date (day)
  const groupedByDay = filteredMatches.reduce<Record<string, Match[]>>(
    (acc, match) => {
      const date = new Date(match.date);
      const dayKey = date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(match);
      return acc;
    },
    {}
  );

  // Sort days chronologically
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
    const dateA = new Date(groupedByDay[a][0].date);
    const dateB = new Date(groupedByDay[b][0].date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="flex flex-col gap-6">
      {sortedDays.map((day) => (
        <div key={day}>
          <h3 className="text-lg font-semibold mb-3 text-white/80 pb-2">
            {day}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {groupedByDay[day]
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((match) => (
                <MatchCard
                  key={match.game}
                  match={match}
                  isOwnProfile={isOwnProfile}
                  userId={userId}
                  prediction={predictions?.[match.game]}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
