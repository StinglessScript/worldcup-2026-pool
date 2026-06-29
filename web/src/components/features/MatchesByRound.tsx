import {
  type Match,
  type MatchesData,
  type UserPredictions,
} from '../../services';
import { isLive, isFinished, roundLabelVi, roundGameIds } from '../../utils';
import { MatchCard } from './MatchCard';

type MatchesByRoundProps = {
  matches: MatchesData;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: UserPredictions;
  /** Hide finished matches (home "upcoming" tab). */
  excludeFinished?: boolean;
  /** Hide live matches. */
  excludeLive?: boolean;
  /** Only knockout rounds (drop group stage). */
  knockoutOnly?: boolean;
};

/**
 * Upcoming matches grouped by round (Vòng 1/32, 1/16, Tứ kết…), so knockout
 * ties are easy to track and predict together. Rounds whose teams aren't
 * decided yet still show ("Chờ xác định"); they just can't be predicted.
 */
export const MatchesByRound = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
  excludeFinished = false,
  excludeLive = false,
  knockoutOnly = false,
}: MatchesByRoundProps) => {
  const list = Object.values(matches).filter((m) => {
    if (knockoutOnly && m.group) return false;
    if (excludeFinished && isFinished(m)) return false;
    if (excludeLive && isLive(m)) return false;
    return true;
  });

  const grouped = list.reduce<Record<string, Match[]>>((acc, match) => {
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
      {rounds.map((round) => {
        // Whether this user has already placed their hope star in this round
        // (doesn't reveal which match — that stays hidden until lock).
        const starUsed = roundGameIds(grouped[round][0].game).some(
          (g) => !!predictions?.[String(g)]?.star
        );
        return (
        <div key={round}>
          <div className="flex items-center justify-between mb-3 pb-2">
            <h3 className="text-lg font-semibold text-white/80">
              {roundLabelVi(round)}
            </h3>
            {starUsed && (
              <span className="text-xs text-yellow-300 bg-yellow-500/15 border border-yellow-400/30 px-2 py-0.5 rounded-full">
                ⭐ Đã đặt sao
              </span>
            )}
          </div>
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
        );
      })}
    </div>
  );
};
