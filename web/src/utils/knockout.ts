import type { Match, UserPredictions } from '../services';

// Game numbers per knockout round (FIFA MatchNumber). Used for the
// "one hope star per round" rule.
export const KO_ROUND_GAMES: Record<string, number[]> = {
  r32: Array.from({ length: 16 }, (_, i) => 73 + i),
  r16: [89, 90, 91, 92, 93, 94, 95, 96],
  qf: [97, 98, 99, 100],
  sf: [101, 102],
  third: [103],
  final: [104],
};

export const roundKey = (n: number): string => {
  if (n <= 88) return 'r32';
  if (n <= 96) return 'r16';
  if (n <= 100) return 'qf';
  if (n <= 102) return 'sf';
  if (n === 103) return 'third';
  return 'final';
};

export const roundGameIds = (n: number): number[] => KO_ROUND_GAMES[roundKey(n)] ?? [];

// Knockout matches have no group letter (group stage games carry "A".."L").
export const isKnockout = (m?: Match): boolean => !!m && !m.group;

// FIFA stage names → short Vietnamese round labels.
const ROUND_LABELS: Record<string, string> = {
  'First Stage': 'Vòng bảng',
  'First stage': 'Vòng bảng',
  'Round of 32': 'Vòng 1/32',
  'Round of 16': 'Vòng 1/16',
  'Quarter-final': 'Tứ kết',
  'Quarter-finals': 'Tứ kết',
  'Semi-final': 'Bán kết',
  'Semi-finals': 'Bán kết',
  'Play-off for third place': 'Tranh hạng 3',
  Final: 'Chung kết',
};
export const roundLabelVi = (round: string): string => ROUND_LABELS[round] ?? round;

// The game id in the same round the user has already starred (excluding `n`),
// or undefined. Enforces one star per round in the UI.
export const roundStarGame = (
  predictions: UserPredictions,
  n: number
): number | undefined => {
  for (const g of roundGameIds(n)) {
    if (g !== n && predictions[String(g)]?.star) return g;
  }
  return undefined;
};
