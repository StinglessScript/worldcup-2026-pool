import { AppLayout, Card } from '../components';
import { vi } from '../i18n';

export const Rules = () => {
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
      </div>
    </AppLayout>
  );
};
