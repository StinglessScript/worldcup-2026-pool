import { AppLayout, LeaderboardList } from '../components';
import { vi } from '../i18n';

export const Leaderboard = () => {
  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{vi.leaderboard.title}</h1>
        <LeaderboardList variant="full" />
      </div>
    </AppLayout>
  );
};
