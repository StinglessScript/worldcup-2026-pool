import {
  type Match,
  type MatchesData,
  type UserPredictions,
} from '../../services';
import { vi } from '../../i18n';
import { MatchCard } from './MatchCard';

type MatchesByGroupProps = {
  matches: MatchesData;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: UserPredictions;
  filter?: 'groupStage' | 'knockout';
};

export const MatchesByGroup = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
  filter,
}: MatchesByGroupProps) => {
  // Group matches by group (or round if group is null)
  const groupedMatches = Object.values(matches).reduce<Record<string, Match[]>>(
    (acc, match) => {
      const groupKey = match.group
        ? `${vi.match.group} ${match.group}`
        : match.round;

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(match);
      return acc;
    },
    {}
  );

  // Determine which groups are group stage vs knockout
  const isGroupStage = (key: string) => key.startsWith(vi.match.group + ' ');

  // Filter groups based on the filter prop
  const filteredGroups = Object.keys(groupedMatches).filter((key) => {
    if (!filter) return true;
    if (filter === 'groupStage') return isGroupStage(key);
    return !isGroupStage(key);
  });

  // Sort groups: A-L first, then knockout rounds
  const sortedGroups = filteredGroups.sort((a, b) => {
    const isGroupA = isGroupStage(a);
    const isGroupB = isGroupStage(b);

    if (isGroupA && isGroupB) {
      return a.localeCompare(b);
    }
    if (isGroupA) return -1;
    if (isGroupB) return 1;

    // Sort knockout rounds by first match timestamp
    const firstMatchA = groupedMatches[a][0];
    const firstMatchB = groupedMatches[b][0];
    return firstMatchA.timestamp - firstMatchB.timestamp;
  });

  return (
    <div className="flex flex-col gap-6">
      {sortedGroups.map((group) => (
        <div key={group}>
          <h3 className="text-lg font-semibold mb-3 text-white/80 pb-2">
            {group}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {groupedMatches[group]
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
