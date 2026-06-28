import React from 'react';
import { AppLayout } from '../components';
import { useMatches, useAuth } from '../hooks';
import { vi } from '../i18n';
import {
  savePrediction,
  subscribeToPredictions,
  type Match,
  type MatchesData,
  type Prediction,
  type UserPredictions,
} from '../services';

// Flags (same pattern as other routes)
const flagModules: Record<string, string> = import.meta.glob(
  '../assets/flags/*.png',
  { eager: true, import: 'default' }
);
const getFlag = (code: string): string | null =>
  flagModules[`../assets/flags/${code}.png`] ?? null;

// Fixed knockout wiring (match number -> its two feeder matches).
const CHILDREN: Record<number, [number, number]> = {
  101: [97, 98],
  102: [99, 100],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  89: [74, 77],
  90: [73, 75],
  93: [83, 84],
  94: [81, 82],
  91: [76, 78],
  92: [79, 80],
  95: [86, 88],
  96: [85, 87],
};

// Game ids per round, for "one star per round" enforcement.
const ROUND_GAMES: Record<string, number[]> = {
  r32: Array.from({ length: 16 }, (_, i) => 73 + i),
  r16: [89, 90, 91, 92, 93, 94, 95, 96],
  qf: [97, 98, 99, 100],
  sf: [101, 102],
  third: [103],
  final: [104],
};
const roundOf = (n: number): string => {
  if (n <= 88) return 'r32';
  if (n <= 96) return 'r16';
  if (n <= 100) return 'qf';
  if (n <= 102) return 'sf';
  if (n === 103) return 'third';
  return 'final';
};

const LOCK_MS = 10 * 60 * 1000;
const isLocked = (m?: Match) =>
  !m || Date.now() > m.timestamp * 1000 - LOCK_MS;

type Side = 'left' | 'right';

const formatKickoff = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};

const TeamRow = ({
  code,
  score,
  win,
  played,
}: {
  code: string;
  score: number;
  win: boolean;
  played: boolean;
}) => {
  const flag = code ? getFlag(code) : null;
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 ${
        win ? 'text-white' : played ? 'text-white/40' : 'text-white/70'
      }`}
    >
      {flag ? (
        <img src={flag} alt={code} className="h-4 w-6 object-contain rounded-sm shrink-0" />
      ) : (
        <span className="h-4 w-6 rounded-sm bg-white/10 shrink-0" />
      )}
      <span className="text-xs font-medium truncate flex-1">{code || '—'}</span>
      <span className="text-xs font-bold tabular-nums w-3 text-right">
        {score >= 0 ? score : ''}
      </span>
    </div>
  );
};

const MatchCard = ({
  match,
  prediction,
  canPredict,
  onClick,
}: {
  match?: Match;
  prediction?: Prediction;
  canPredict?: boolean;
  onClick?: () => void;
}) => {
  const played = !!match && match.homeScore >= 0 && match.awayScore >= 0;
  const homeWin = played && match!.homeScore > match!.awayScore;
  const awayWin = played && match!.awayScore > match!.homeScore;
  const kickoff = formatKickoff(match?.date);
  const clickable = canPredict && !!onClick;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={`w-28 sm:w-32 rounded-lg border bg-white/5 overflow-hidden shrink-0 text-left ${
        clickable
          ? 'border-blue-400/40 hover:bg-white/10 cursor-pointer'
          : 'border-white/15 cursor-default'
      }`}
    >
      {kickoff && (
        <div className="px-2 py-1 text-[10px] text-white/40 border-b border-white/10 text-center">
          {kickoff}
        </div>
      )}
      <TeamRow
        code={match?.home ?? ''}
        score={match?.homeScore ?? -1}
        win={homeWin}
        played={played}
      />
      <div className="border-t border-white/10" />
      <TeamRow
        code={match?.away ?? ''}
        score={match?.awayScore ?? -1}
        win={awayWin}
        played={played}
      />
      {/* Prediction / CTA footer */}
      {prediction ? (
        <div className="px-2 py-1 text-[10px] text-blue-300 border-t border-white/10 flex items-center gap-1">
          <span>
            Dự: {prediction.homePrediction}-{prediction.awayPrediction}
          </span>
          {prediction.star && <span className="text-yellow-300">⭐</span>}
        </div>
      ) : clickable ? (
        <div className="px-2 py-1 text-[10px] text-blue-300/80 border-t border-white/10 text-center">
          Dự đoán
        </div>
      ) : null}
    </button>
  );
};

const LINE = 'bg-white/20';
const Stub = () => <div className={`h-px w-3 ${LINE}`} />;

type NodeProps = {
  num: number;
  matches: MatchesData;
  predictions: UserPredictions;
  side: Side;
  canPredict: boolean;
  onPick: (gameId: number) => void;
};

const Node = ({ num, matches, predictions, side, canPredict, onPick }: NodeProps) => {
  const kids = CHILDREN[num];
  const match = matches[String(num)];
  const hasTeams = !!match && !!match.home && !!match.away;
  const predictable = canPredict && hasTeams && !isLocked(match);

  const card = (
    <MatchCard
      match={match}
      prediction={predictions[String(num)]}
      canPredict={predictable}
      onClick={() => onPick(num)}
    />
  );

  if (!kids) return card;

  const childrenCol = (
    <div className="flex flex-col justify-center gap-3 sm:gap-4">
      {kids.map((k) => (
        <div key={k} className="flex items-center">
          {side === 'right' && <Stub />}
          <Node
            num={k}
            matches={matches}
            predictions={predictions}
            side={side}
            canPredict={canPredict}
            onPick={onPick}
          />
          {side === 'left' && <Stub />}
        </div>
      ))}
    </div>
  );

  const joiner = <div className={`w-px self-stretch ${LINE}`} />;
  const toParent = <div className={`h-px w-3 self-center ${LINE}`} />;

  return (
    <div className="flex items-stretch">
      {side === 'left' ? (
        <>
          {childrenCol}
          {joiner}
          {toParent}
          <div className="self-center">{card}</div>
        </>
      ) : (
        <>
          <div className="self-center">{card}</div>
          {toParent}
          {joiner}
          {childrenCol}
        </>
      )}
    </div>
  );
};

export const Bracket = () => {
  const { matches, loading } = useMatches();
  const { user } = useAuth();
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [pick, setPick] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!user) {
      setPredictions({});
      return;
    }
    return subscribeToPredictions(user.uid, setPredictions);
  }, [user]);

  const canPredict = !!user;

  return (
    <AppLayout>
      <div className="pt-4 px-4 pb-8">
        {loading || !matches ? (
          <p className="text-white/50">{vi.common.loading}</p>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center justify-center gap-2 min-w-max mx-auto">
              <Node
                num={101}
                matches={matches}
                predictions={predictions}
                side="left"
                canPredict={canPredict}
                onPick={setPick}
              />

              <div className="flex flex-col items-center gap-3 px-2">
                <span className="text-3xl">🏆</span>
                <span className="text-xs font-semibold text-yellow-300">
                  {vi.bracket.final}
                </span>
                <MatchCard
                  match={matches['104']}
                  prediction={predictions['104']}
                  canPredict={canPredict && !isLocked(matches['104']) && !!matches['104']?.home}
                  onClick={() => setPick(104)}
                />
                <div className="mt-4 text-center">
                  <span className="text-[10px] text-white/40 block mb-1">
                    {vi.bracket.thirdPlace}
                  </span>
                  <MatchCard
                    match={matches['103']}
                    prediction={predictions['103']}
                    canPredict={canPredict && !isLocked(matches['103']) && !!matches['103']?.home}
                    onClick={() => setPick(103)}
                  />
                </div>
              </div>

              <Node
                num={102}
                matches={matches}
                predictions={predictions}
                side="right"
                canPredict={canPredict}
                onPick={setPick}
              />
            </div>
          </div>
        )}
      </div>

      {pick != null && user && matches && matches[String(pick)] && (
        <PredictModal
          gameId={pick}
          match={matches[String(pick)]}
          userId={user.uid}
          existing={predictions[String(pick)]}
          predictions={predictions}
          onClose={() => setPick(null)}
        />
      )}
    </AppLayout>
  );
};

// ---- Knockout prediction modal ----

const PredictModal = ({
  gameId,
  match,
  userId,
  existing,
  predictions,
  onClose,
}: {
  gameId: number;
  match: Match;
  userId: string;
  existing?: Prediction;
  predictions: UserPredictions;
  onClose: () => void;
}) => {
  const [home, setHome] = React.useState(
    existing ? String(existing.homePrediction) : ''
  );
  const [away, setAway] = React.useState(
    existing ? String(existing.awayPrediction) : ''
  );
  const [advance, setAdvance] = React.useState<'home' | 'away'>(
    existing?.advance ?? 'home'
  );
  const [star, setStar] = React.useState(!!existing?.star);
  const [saving, setSaving] = React.useState(false);

  const h = parseInt(home, 10);
  const a = parseInt(away, 10);
  const valid = !isNaN(h) && !isNaN(a);
  const isDraw = valid && h === a;
  const predAdvance: 'home' | 'away' | null = !valid
    ? null
    : isDraw
      ? advance
      : h > a
        ? 'home'
        : 'away';

  const round = roundOf(gameId);
  const roundGames = ROUND_GAMES[round] ?? [];
  // Another game in this round already starred?
  const otherStar = roundGames.find(
    (g) => g !== gameId && predictions[String(g)]?.star
  );

  const teamName = (side: 'home' | 'away') =>
    side === 'home' ? match.homeName || match.home : match.awayName || match.away;
  const teamCode = (side: 'home' | 'away') =>
    side === 'home' ? match.home : match.away;

  const canSave = valid && predAdvance != null && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await savePrediction(userId, gameId, h, a, {
        advance: predAdvance!,
        star,
        clearStarGameIds: star ? roundGames : undefined,
      });
      onClose();
    } catch (e) {
      console.error('save prediction failed', e);
      setSaving(false);
    }
  };

  const teamBtn = (side: 'home' | 'away') => {
    const flag = getFlag(teamCode(side));
    const sel = predAdvance === side;
    return (
      <button
        type="button"
        onClick={() => setAdvance(side)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm flex-1 justify-center ${
          sel
            ? 'border-green-400/40 bg-green-600/20 text-white'
            : 'border-white/15 bg-white/5 text-white/60'
        }`}
      >
        {flag && <img src={flag} alt="" className="h-4 w-6 object-contain rounded-sm" />}
        {teamName(side)}
        {sel && <span className="text-green-400">✓</span>}
      </button>
    );
  };

  const scoreInput = (val: string, set: (v: string) => void) => (
    <input
      type="text"
      inputMode="numeric"
      maxLength={2}
      value={val}
      onChange={(e) => set(e.target.value.replace(/\D/g, '').slice(0, 2))}
      onFocus={(e) => e.target.select()}
      className="w-12 h-10 text-center bg-white/10 border border-white/20 rounded text-white text-xl font-bold focus:outline-none focus:border-white/40"
      placeholder="-"
    />
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-neutral-900 border border-white/15 rounded-t-2xl sm:rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-white/70 bg-white/10 px-2 py-1 rounded">
            {match.round}
          </span>
          <button onClick={onClose} className="text-white/50 text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Score inputs */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            {getFlag(match.home) && (
              <img src={getFlag(match.home)!} alt="" className="h-5 w-8 object-contain rounded-sm" />
            )}
            <span className="text-sm font-medium">{match.home}</span>
          </div>
          {scoreInput(home, setHome)}
          <span className="text-white/40">-</span>
          {scoreInput(away, setAway)}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{match.away}</span>
            {getFlag(match.away) && (
              <img src={getFlag(match.away)!} alt="" className="h-5 w-8 object-contain rounded-sm" />
            )}
          </div>
        </div>

        {/* Advance picker */}
        <div className="mb-4">
          <div className="text-xs text-white/50 mb-2">
            {vi.rules.advancePickLabel}
            {isDraw && <span className="text-yellow-400/80"> (hòa — chọn đội thắng luân lưu)</span>}
          </div>
          <div className="flex gap-2">
            {teamBtn('home')}
            {teamBtn('away')}
          </div>
        </div>

        {/* Star toggle */}
        <button
          type="button"
          onClick={() => setStar((s) => !s)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm mb-2 ${
            star
              ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-300'
              : 'border-white/15 bg-white/5 text-white/60'
          }`}
        >
          <span>{star ? '⭐' : '☆'}</span>
          {vi.rules.starTitle}
        </button>
        {star && otherStar && (
          <p className="text-[11px] text-yellow-300/70 mb-2">
            Vòng này bạn đang đặt sao ở trận khác — lưu sẽ chuyển sao sang trận này.
          </p>
        )}

        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="w-full mt-2 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-40"
        >
          {saving ? 'Đang lưu...' : vi.bracket.save}
        </button>
      </div>
    </div>
  );
};
