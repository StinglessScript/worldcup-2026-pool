import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppLayout } from '../components';
import { Card, ProfilePicture } from '../components/ui';
import { useAuth, useLeague, useMatches } from '../hooks';
import { vi } from '../i18n';
import {
  getPredictionsForGame,
  subscribeToLeaderboard,
  type Prediction,
  type UserWithId,
} from '../services';
import { isKnockout, isLive, roundLabelVi } from '../utils';

// Country flags (path is relative to this file in routes/).
const flagModules: Record<string, string> = import.meta.glob(
  '../assets/flags/*.png',
  { eager: true, import: 'default' }
);
const getFlag = (code: string): string =>
  flagModules[`../assets/flags/${code}.png`] ??
  flagModules['../assets/flags/UNKNOWN.png'];

type Row = {
  user: UserWithId;
  prediction: Prediction;
};

const PointsBadge = ({ points }: { points: number }) => {
  const positive = points > 0;
  return (
    <div
      className={`flex flex-col items-center justify-center border rounded-lg w-14 shrink-0 ${
        positive
          ? 'border-green-500/20 bg-green-600/10'
          : 'border-red-500/20 bg-red-600/10'
      }`}
    >
      <span className="flex-1 flex items-center text-xl pt-1">
        {points >= 15 ? '🥳' : positive ? '😄' : '😔'}
      </span>
      <span
        className={`flex items-center justify-center text-xs px-1 py-0.5 w-full rounded-b ${
          positive ? 'bg-green-800 text-white' : 'bg-red-800 text-white'
        }`}
      >
        {positive ? `+${points}` : points} {vi.match.pts}
      </span>
    </div>
  );
};

export const MatchDetail = () => {
  const { gameId } = useParams();
  const { matches, loading: matchesLoading } = useMatches();
  const { user } = useAuth();
  const { selectedLeague, leagueMemberIds } = useLeague();

  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const [predictions, setPredictions] = React.useState<
    Record<string, Prediction>
  >({});
  const [predsLoading, setPredsLoading] = React.useState(true);

  const match = gameId ? matches?.[gameId] : undefined;

  const isPlayed =
    !!match && match.homeScore >= 0 && match.awayScore >= 0;
  const predictionsClosed =
    !!match && Date.now() > match.timestamp * 1000 - 10 * 60 * 1000;
  const knockout = !!match && isKnockout(match) && !!match.home && !!match.away;

  // All real users (mock users already filtered out), optionally scoped to the
  // currently selected league.
  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard(setAllUsers);
    return () => unsubscribe();
  }, []);

  const users = React.useMemo(() => {
    if (selectedLeague && leagueMemberIds.length > 0) {
      return allUsers.filter((u) => leagueMemberIds.includes(u.id));
    }
    return allUsers;
  }, [allUsers, selectedLeague, leagueMemberIds]);

  // Stable dependency for the fetch effect.
  const userIdsKey = users.map((u) => u.id).join(',');

  // Once predictions are locked, reveal everyone's. Before lock, only fetch the
  // viewer's own pick (others stay hidden — same rule as the match cards).
  React.useEffect(() => {
    // Wait for the user list before fetching (avoids an empty-state flash).
    if (!gameId || users.length === 0) {
      setPredictions({});
      return;
    }
    let cancelled = false;
    setPredsLoading(true);

    const targets = predictionsClosed
      ? users.map((u) => u.id)
      : user
        ? [user.uid]
        : [];

    if (targets.length === 0) {
      setPredictions({});
      setPredsLoading(false);
      return;
    }

    getPredictionsForGame(targets, Number(gameId))
      .then((preds) => {
        if (!cancelled) setPredictions(preds);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setPredsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // userIdsKey captures the user list; gameId/closed/uid cover the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, userIdsKey, predictionsClosed, user]);

  const rows = React.useMemo<Row[]>(() => {
    const list = users
      .filter((u) => predictions[u.id])
      .map((u) => ({ user: u, prediction: predictions[u.id] }));

    list.sort((a, b) => {
      if (isPlayed && b.prediction.points !== a.prediction.points) {
        return b.prediction.points - a.prediction.points;
      }
      return a.user.displayName.localeCompare(b.user.displayName);
    });
    return list;
  }, [users, predictions, isPlayed]);

  const exactCount = React.useMemo(
    () =>
      match
        ? rows.filter(
            (r) =>
              r.prediction.homePrediction === match.homeScore &&
              r.prediction.awayPrediction === match.awayScore
          ).length
        : 0,
    [rows, match]
  );

  const loading = matchesLoading || (predsLoading && predictionsClosed);

  if (!matchesLoading && !match) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-3xl mx-auto text-center">
          <p className="text-white/70 py-20">{vi.matchDetail.notFound}</p>
          <Link to="/" className="text-blue-400 hover:underline">
            {vi.matchDetail.back}
          </Link>
        </div>
      </AppLayout>
    );
  }

  const matchDate = match ? new Date(match.date) : null;
  const timeString = matchDate
    ? matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const dateString = matchDate
    ? matchDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      })
    : '';

  const teamRow = (
    code: string,
    name: string,
    score: number,
    advances: boolean
  ) => (
    <div className="flex items-center gap-3">
      <img
        src={getFlag(code)}
        alt={code}
        className="h-7 w-11 object-contain rounded-sm"
      />
      <span
        className={`flex-1 font-semibold text-base md:text-lg ${
          name ? '' : 'text-white/40 italic'
        }`}
      >
        {name || 'Chờ xác định'}
        {knockout && advances && isPlayed && (
          <span className="ml-2 text-xs text-green-400">✓ {vi.matchDetail.advance}</span>
        )}
      </span>
      <span className="text-2xl font-bold tabular-nums w-8 text-center">
        {isPlayed ? score : '-'}
      </span>
    </div>
  );

  return (
    <AppLayout>
      <div className="pt-6 px-4 pb-8 max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white/80 mb-4"
        >
          ← {vi.matchDetail.back}
        </Link>

        {loading || !match ? (
          <div className="text-center text-white/70 py-20">
            {vi.matchDetail.loading}
          </div>
        ) : (
          <>
            {/* Match summary */}
            <Card className="p-5 mb-6">
              <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                <span className="font-medium text-white/70">
                  {roundLabelVi(match.round)}
                  {match.group && ` · ${vi.match.group} ${match.group}`}
                </span>
                {isLive(match) ? (
                  <span className="flex items-center gap-1.5 text-red-500 font-bold animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    {vi.match.live}
                  </span>
                ) : (
                  <span>
                    {dateString}, {timeString}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {teamRow(
                  match.home,
                  match.homeName,
                  match.homeScore,
                  match.winner === 'home'
                )}
                {teamRow(
                  match.away,
                  match.awayName,
                  match.awayScore,
                  match.winner === 'away'
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40 flex items-center gap-2">
                <span>
                  {match.locationCity}
                  {match.locationCountry && `, ${match.locationCountry}`}
                </span>
              </div>
            </Card>

            {/* Everyone's predictions */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white/80">
                {vi.matchDetail.title}
              </h2>
              {predictionsClosed && rows.length > 0 && (
                <span className="text-xs text-white/40">
                  {vi.matchDetail.count(rows.length)}
                  {isPlayed && exactCount > 0 && (
                    <> · 🥳 {vi.matchDetail.exactCount(exactCount)}</>
                  )}
                </span>
              )}
            </div>

            {!predictionsClosed ? (
              <Card className="p-6 text-center">
                <p className="text-white/70 font-medium mb-1">
                  🔒 {vi.matchDetail.lockedTitle}
                </p>
                <p className="text-sm text-white/40 mb-4">
                  {vi.matchDetail.lockedDesc}
                </p>
                {user && predictions[user.uid] && (
                  <div className="inline-flex items-center gap-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                    <span className="text-white/40">
                      {vi.matchDetail.yourPrediction}:
                    </span>
                    <span className="font-bold tabular-nums">
                      {predictions[user.uid].homePrediction} -{' '}
                      {predictions[user.uid].awayPrediction}
                    </span>
                  </div>
                )}
              </Card>
            ) : rows.length === 0 ? (
              <Card className="p-6 text-center text-white/50">
                {vi.matchDetail.noPredictions}
              </Card>
            ) : (
              <Card className="p-2 md:p-3">
                <div className="flex flex-col gap-1">
                  {rows.map(({ user: u, prediction }) => {
                    const isCurrentUser = user?.uid === u.id;
                    const advanceCode =
                      prediction.advance === 'home'
                        ? match.home
                        : prediction.advance === 'away'
                          ? match.away
                          : null;
                    return (
                      <div
                        key={u.id}
                        className={`flex items-center gap-3 rounded-md px-2 py-2 ${
                          isCurrentUser
                            ? 'border border-white/[0.12] bg-white/[0.06]'
                            : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <Link
                          to={`/${u.userName}`}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          <ProfilePicture
                            src={u.photoURL}
                            name={u.displayName}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white/90 truncate">
                              {u.displayName}
                            </div>
                            <div className="text-white/30 text-xs truncate">
                              @{u.userName}
                            </div>
                          </div>
                        </Link>

                        {/* Knockout: advance pick + hope star */}
                        {knockout && advanceCode && (
                          <span className="flex items-center gap-1 text-white/50">
                            {prediction.star && (
                              <span className="text-yellow-300">⭐</span>
                            )}
                            <img
                              src={getFlag(advanceCode)}
                              alt=""
                              className="h-3.5 w-5 object-contain rounded-sm"
                            />
                          </span>
                        )}

                        {/* Predicted scoreline */}
                        <span className="flex items-center justify-center bg-blue-600/30 border border-blue-400/30 rounded px-2.5 py-1 text-base font-bold tabular-nums shrink-0">
                          {prediction.homePrediction} -{' '}
                          {prediction.awayPrediction}
                        </span>

                        {/* Points (once played) */}
                        {isPlayed && <PointsBadge points={prediction.points} />}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
