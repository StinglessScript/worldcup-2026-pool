import {
  type Match,
  type MatchesData,
  type UserPredictions,
} from '../../services';
import { isLive, isFinished, roundLabelVi } from '../../utils';
import { MatchCard } from './MatchCard';

type MatchesByRoundProps = {
  matches: MatchesData;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: UserPredictions;
};

/**
 * Upcoming matches grouped by round (Vòng 1/32, 1/16, Tứ kết…), so knockout
 * ties are easy to track and predict together. Matches without both teams
 * decided yet are hidden (they can't be predicted).
 */
export const MatchesByRound = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
}: MatchesByRoundProps) => {
  const upcoming = Object.values(matches).filter(
    (m) => !isFinished(m) && !isLive(m) && !!m.home && !!m.away
  );

  const grouped = upcoming.reduce<Record<string, Match[]>>((acc, match) => {
    const key = match.round || '';
    (acc[key] ??= []).push(match);
    return acc;
  }, {});

  // Order rounds by their earliest kickoff.
  const rounds = Object.keys(grouped).sort(
    (a, b) =>
      Math.min(...grouped[a].map((m) => m.timestamp)) -
      Math.min(...grouped[b].map((m) => m.timestamp))
  );

  return (
    <div className="flex flex-col gap-6">
      {rounds.map((round) => (
        <div key={round}>
          <h3 className="text-lg font-semibold mb-3 text-white/80 pb-2">
            {roundLabelVi(round)}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {grouped[round]
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((match) => (
                <MatchCard
                  key={match.game}
                  match={match}
                  isOwnProfile={isOwnProfile}
                  userId={userId}
                  prediction={predictions?.[match.game]}
                  predictions={predictions}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
