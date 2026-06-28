import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout, Card } from '../components';
import { vi } from '../i18n';

// Flags (same pattern as MatchCard)
const flagModules: Record<string, string> = import.meta.glob(
  '../assets/flags/*.png',
  { eager: true, import: 'default' }
);
const getFlag = (code: string): string =>
  flagModules[`../assets/flags/${code}.png`] ??
  flagModules['../assets/flags/UNKNOWN.png'];

export const Rules = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: 'group' | 'knockout' =
    searchParams.get('tab') === 'knockout' ? 'knockout' : 'group';
  const setTab = (next: 'group' | 'knockout') =>
    setSearchParams(next === 'knockout' ? { tab: 'knockout' } : {}, {
      replace: true,
    });

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{vi.rules.title}</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {vi.rules.predictionDeadline}
          </h2>
          <div className="flex items-start gap-3 text-white/80">
            <span className="text-2xl">⏰</span>
            <p>
              {vi.rules.deadlineDesc}{' '}
              <span className="text-white font-semibold">
                {vi.rules.deadlineTime}
              </span>
              {vi.rules.deadlineAfter}
            </p>
          </div>
        </Card>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6">
          {([
            { id: 'group', label: vi.rules.tabGroup },
            { id: 'knockout', label: vi.rules.tabKnockout },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'group' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {vi.rules.howPointsWork}
          </h2>

          <div className="space-y-4 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🥳</span>
              <div>
                <h3 className="font-semibold text-white">
                  {vi.rules.exactScore}
                </h3>
                <p className="text-sm">
                  {vi.rules.exactScoreDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">😄</span>
              <div>
                <h3 className="font-semibold text-white">
                  {vi.rules.correctResult}
                </h3>
                <p className="text-sm">
                  {vi.rules.correctResultDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">😔</span>
              <div>
                <h3 className="font-semibold text-white">
                  {vi.rules.wrongResult}
                </h3>
                <p className="text-sm">
                  {vi.rules.wrongResultDesc}
                </p>
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-white mb-4">
            {vi.rules.examples}
          </h2>

          <div className="space-y-6">
            {/* Example 1: Exact score */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.actualResult}</span>
                <span className="text-white font-mono">
                  Mexico 2 - 1 South Africa
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.yourPrediction}</span>
                <span className="text-white font-mono">
                  Mexico 2 - 1 South Africa
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">{vi.rules.pointsEarned}</span>
                <span className="text-green-400 font-bold">
                  🥳 15 {vi.match.pts} ({vi.rules.exact})
                </span>
              </div>
            </div>

            {/* Example 2: Correct winner */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.actualResult}</span>
                <span className="text-white font-mono">
                  Brazil 2 - 1 Morocco
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.yourPrediction}</span>
                <span className="text-white font-mono">
                  Brazil 3 - 0 Morocco
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">{vi.rules.pointsEarned}</span>
                <div className="md:text-right">
                  <span className="text-yellow-400 font-bold">😄 8 {vi.match.pts}</span>
                  <div className="text-white/40 text-xs font-mono">
                    10 - |3-2| - |0-1| = 8
                  </div>
                </div>
              </div>
            </div>

            {/* Example 3: Correct draw */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.actualResult}</span>
                <span className="text-white font-mono">
                  Netherlands 2 - 2 Japan
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.yourPrediction}</span>
                <span className="text-white font-mono">
                  Netherlands 0 - 0 Japan
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">{vi.rules.pointsEarned}</span>
                <div className="md:text-right">
                  <span className="text-yellow-400 font-bold">😄 6 {vi.match.pts}</span>
                  <div className="text-white/40 text-xs font-mono">
                    10 - |0-2| - |0-2| = 6
                  </div>
                </div>
              </div>
            </div>

            {/* Example 4: Wrong result */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.actualResult}</span>
                <span className="text-white font-mono">
                  England 2 - 1 Croatia
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">{vi.rules.yourPrediction}</span>
                <span className="text-white font-mono">
                  England 0 - 2 Croatia
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">{vi.rules.pointsEarned}</span>
                <span className="text-red-400 font-bold">
                  😔 0 {vi.match.pts} ({vi.rules.wrongWinner})
                </span>
              </div>
            </div>
          </div>
        </Card>
        )}

        {tab === 'knockout' && (
        <>
        {/* Knockout — đội đi tiếp */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {vi.rules.knockoutTitle}
          </h2>
          <p className="text-white/80 text-sm mb-5">{vi.rules.knockoutIntro}</p>

          <h3 className="text-white/90 font-semibold mb-3">{vi.rules.koScoreTitle}</h3>
          <div className="space-y-3 text-white/80 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold text-white">{vi.rules.koExactScore}</h4>
                <p className="text-sm">{vi.rules.koExactScoreDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">😄</span>
              <div>
                <h4 className="font-semibold text-white">{vi.rules.correctResult}</h4>
                <p className="text-sm">{vi.rules.correctResultDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">😔</span>
              <div>
                <h4 className="font-semibold text-white">{vi.rules.wrongResult}</h4>
                <p className="text-sm">{vi.rules.wrongResultDesc}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 mb-4">
            <div className="flex items-start gap-3 text-white/80">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-white">{vi.rules.advanceBonus}</h4>
                <p className="text-sm">{vi.rules.advanceBonusDesc}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-white/60 text-sm">
            <span className="text-xl">💡</span>
            <p>{vi.rules.knockoutNote}</p>
          </div>
        </Card>

        {/* Demo card dự đoán knockout */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">
            Thử dự đoán (mẫu)
          </h2>
          <p className="text-white/50 text-sm mb-4">
            Chọn vòng, nhập <span className="text-blue-300">dự đoán</span> và{' '}
            <span className="text-white/80">kết quả thật</span>, bật Ngôi sao hi vọng — điểm tính lại ngay.
          </p>
          <KnockoutDemoCard />
        </Card>

        {/* Hệ số mỗi vòng */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {vi.rules.multiplierTitle}
          </h2>
          <p className="text-white/80 text-sm mb-4">{vi.rules.multiplierDesc}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {vi.rules.multipliers.map((m) => (
              <div
                key={m.round}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <span className="text-white/80 text-sm">{m.round}</span>
                <span className="text-green-400 font-bold font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Ngôi sao hi vọng */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            ⭐ {vi.rules.starTitle}
          </h2>
          <p className="text-white/80 text-sm mb-4">{vi.rules.starDesc}</p>

          <ul className="space-y-2">
            {vi.rules.starRules.map((r) => (
              <li key={r} className="flex items-start gap-2 text-white/80 text-sm">
                <span className="text-yellow-400 mt-0.5">⭐</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Công thức + ví dụ knockout */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {vi.rules.formulaTitle}
          </h2>
          <div className="rounded-lg bg-white/5 px-4 py-3 text-center text-white/90 font-mono text-sm mb-6">
            {vi.rules.formula}
          </div>

          <h2 className="text-xl font-semibold text-white mb-4">
            {vi.rules.knockoutExampleTitle}
          </h2>
          <div className="space-y-2 text-sm border-b border-white/10 pb-6 mb-6">
            <div className="text-yellow-400 font-semibold mb-1">⭐ Đặt đúng đội đi tiếp</div>
            <Row label={vi.rules.roundLabel} value="Bán kết (×4)" />
            <Row label={vi.rules.actualResult} value="Argentina 2 - 0 France (Argentina đi tiếp)" />
            <Row label={vi.rules.yourPrediction} value="Argentina 2 - 0 France" />
            <Row label={vi.rules.advancePickLabel} value="⭐ Argentina" />
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="text-white/40 text-xs font-mono mb-1">
                (15 đúng tỉ số + 5 đội đi tiếp) × 4 × 2 = 160
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">{vi.rules.totalLabel}</span>
                <span className="text-green-400 font-bold">160 {vi.match.pts}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="text-red-400 font-semibold mb-1">⭐ Đặt sai đội đi tiếp</div>
            <Row label={vi.rules.roundLabel} value="Bán kết (×4)" />
            <Row label={vi.rules.actualResult} value="Argentina 2 - 0 France (Argentina đi tiếp)" />
            <Row label={vi.rules.yourPrediction} value="France 2 - 1 Argentina" />
            <Row label={vi.rules.advancePickLabel} value="⭐ France" />
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="text-white/40 text-xs font-mono mb-1">
                −10 × 4 = −40
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">{vi.rules.totalLabel}</span>
                <span className="text-red-400 font-bold">−40 {vi.match.pts}</span>
              </div>
            </div>
          </div>
        </Card>
        </>
        )}
      </div>
    </AppLayout>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
    <span className="text-white/60">{label}</span>
    <span className="text-white font-mono">{value}</span>
  </div>
);

// Interactive mockup of a knockout prediction card (demo only, no saving)
const TEAMS = {
  home: { code: 'ARG', name: 'Argentina' },
  away: { code: 'FRA', name: 'France' },
};
const ROUNDS = [
  { name: 'Vòng 1/32', mult: 1 },
  { name: 'Vòng 1/16', mult: 2 },
  { name: 'Tứ kết', mult: 3 },
  { name: 'Bán kết', mult: 4 },
  { name: 'Chung kết', mult: 5 },
];

const scoreInputClass =
  'w-10 h-8 text-center bg-white/10 border border-white/20 rounded text-white text-lg font-bold focus:outline-none focus:border-white/40';

type Side = 'home' | 'away';

// Winner derived from a scoreline; on a draw fall back to the explicit pick
const winnerOf = (h: number, a: number, pick: Side): Side | null => {
  if (isNaN(h) || isNaN(a)) return null;
  if (h === a) return pick;
  return h > a ? 'home' : 'away';
};

const TeamScoreRow = ({
  side,
  value,
  onChange,
}: {
  side: Side;
  value: string;
  onChange: (v: string) => void;
}) => {
  const t = TEAMS[side];
  return (
    <div className="flex items-center gap-3 mb-2">
      <img src={getFlag(t.code)} alt={t.code} className="h-7 w-10 object-contain rounded-sm" />
      <span className="flex-1 font-medium">{t.name}</span>
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 2))}
        onFocus={(e) => e.target.select()}
        className={scoreInputClass}
        placeholder="-"
      />
    </div>
  );
};

const AdvancePicker = ({
  label,
  hint,
  selected,
  onPick,
}: {
  label: string;
  hint?: string;
  selected: Side | null;
  onPick: (s: Side) => void;
}) => (
  <div className="mt-3 pt-3 border-t border-white/10">
    <div className="text-xs text-white/50 mb-2">
      {label}
      {hint && <span className="text-yellow-400/80"> {hint}</span>}
    </div>
    <div className="flex flex-wrap gap-2">
      {(['home', 'away'] as Side[]).map((side) => {
        const t = TEAMS[side];
        const isSel = selected === side;
        return (
          <button
            key={side}
            type="button"
            onClick={() => onPick(side)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              isSel
                ? 'border-green-400/40 bg-green-600/20 text-white'
                : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <img src={getFlag(t.code)} alt={t.code} className="h-4 w-6 object-contain rounded-sm" />
            {t.name}
            {isSel && <span className="text-green-400">✓</span>}
          </button>
        );
      })}
    </div>
  </div>
);

const KnockoutDemoCard = () => {
  // Prediction
  const [home, setHome] = React.useState('1');
  const [away, setAway] = React.useState('1');
  const [advance, setAdvance] = React.useState<Side>('home');
  const [star, setStar] = React.useState(true);
  // Actual result
  const [actHome, setActHome] = React.useState('2');
  const [actAway, setActAway] = React.useState('0');
  const [actAdv, setActAdv] = React.useState<Side>('home');
  // Round
  const [roundIdx, setRoundIdx] = React.useState(3); // Bán kết
  const mult = ROUNDS[roundIdx].mult;

  const h = parseInt(home, 10);
  const a = parseInt(away, 10);
  const ah = parseInt(actHome, 10);
  const aa = parseInt(actAway, 10);

  const valid = !isNaN(h) && !isNaN(a);
  const actValid = !isNaN(ah) && !isNaN(aa);
  const predIsDraw = valid && h === a;
  const actIsDraw = actValid && ah === aa;

  const predAdvance = winnerOf(h, a, advance);
  const actWinner = winnerOf(ah, aa, actAdv);

  // Score points (giống vòng bảng): đúng tỉ số 15, đúng kết quả 10 − chênh lệch
  let scorePts = 0;
  if (valid && actValid) {
    if (h === ah && a === aa) scorePts = 15;
    else {
      const predWin = h > a ? 'home' : h < a ? 'away' : 'draw';
      const actWin = ah > aa ? 'home' : ah < aa ? 'away' : 'draw';
      if (predWin === actWin)
        scorePts = Math.max(0, 10 - (Math.abs(h - ah) + Math.abs(a - aa)));
    }
  }
  const advanceCorrect =
    predAdvance != null && actWinner != null && predAdvance === actWinner;
  const advancePts = advanceCorrect ? 5 : 0;
  const base = scorePts + advancePts;

  let total = base * mult;
  let starNote = '';
  if (star) {
    if (advanceCorrect) {
      total = total * 2;
      starNote = '×2 (đúng đội đi tiếp)';
    } else {
      total = -10 * mult;
      starNote = '−10 × hệ số (sai đội đi tiếp)';
    }
  }

  const nameOf = (s: Side | null) => (s ? TEAMS[s].name : '—');

  return (
    <Card className="p-4">
      {/* Round selector + star badge */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <select
          value={roundIdx}
          onChange={(e) => setRoundIdx(Number(e.target.value))}
          className="text-xs font-semibold text-white bg-white/10 border border-white/20 px-2 py-1.5 rounded focus:outline-none"
        >
          {ROUNDS.map((r, i) => (
            <option key={r.name} value={i} className="bg-neutral-800">
              {r.name} · ×{r.mult}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setStar((s) => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
            star
              ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-300'
              : 'border-white/15 bg-white/5 text-white/50 hover:bg-white/10'
          }`}
        >
          <span>{star ? '⭐' : '☆'}</span>
          Ngôi sao hi vọng
        </button>
      </div>

      {/* Prediction */}
      <div className="text-xs font-semibold text-blue-300 mb-2">Dự đoán của bạn</div>
      <TeamScoreRow side="home" value={home} onChange={setHome} />
      <TeamScoreRow side="away" value={away} onChange={setAway} />
      <AdvancePicker
        label={vi.rules.advancePickLabel}
        hint={predIsDraw ? '(tỉ số hòa — hãy chọn)' : undefined}
        selected={predAdvance}
        onPick={setAdvance}
      />
      {star && (
        <div className="mt-3 text-xs text-yellow-300/80">
          Đội đặt sao đi tiếp → nhân đôi · bị loại → −10 × hệ số
        </div>
      )}

      {/* Actual result */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="text-xs font-semibold text-white/70 mb-2">Kết quả thật (thử nhập)</div>
        <TeamScoreRow side="home" value={actHome} onChange={setActHome} />
        <TeamScoreRow side="away" value={actAway} onChange={setActAway} />
        <AdvancePicker
          label="Đội đi tiếp thật"
          hint={actIsDraw ? '(hòa → ai thắng luân lưu)' : undefined}
          selected={actWinner}
          onPick={setActAdv}
        />
      </div>

      {/* Breakdown */}
      <div className="mt-5 pt-4 border-t border-white/10 text-sm">
        <div className="text-white/40 text-xs mb-2">
          {nameOf(actWinner)} đi tiếp ·{' '}
          {advanceCorrect ? 'bạn chọn đúng' : `bạn chọn ${nameOf(predAdvance)}`}
        </div>
        <div className="space-y-1 text-white/60 text-xs font-mono">
          <div>Điểm tỉ số: {scorePts}</div>
          <div>Điểm đội đi tiếp: {advancePts}</div>
          <div>Hệ số vòng: ×{mult}</div>
          {star && <div>Ngôi sao: {starNote}</div>}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-white/60">{vi.rules.totalLabel}</span>
          <span className={`font-bold text-lg ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {total > 0 ? '+' : ''}
            {total} {vi.match.pts}
          </span>
        </div>
      </div>
    </Card>
  );
};
