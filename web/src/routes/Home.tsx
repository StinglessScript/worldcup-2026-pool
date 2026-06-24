import React from 'react';
import {
  AppLayout,
  LiveMatches,
  MatchesByDay,
  MatchTabs,
  RecentResults,
  UpcomingMatches,
} from '../components';
import { useMatches, useAuth } from '../hooks';
import { vi } from '../i18n';
import {
  type UserPredictions,
  subscribeToPredictions,
} from '../services';

type Tab = 'schedule' | 'results';

export const Home = () => {
  const { matches, loading, error } = useMatches();
  const { user } = useAuth();
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [activeTab, setActiveTab] = React.useState<Tab>('schedule');

  // Hide splash once data is loaded
  React.useEffect(() => {
    if (!loading && (matches || error)) {
      window.hideSplash?.();
    }
  }, [loading, matches, error]);

  // Subscribe to predictions when user is logged in
  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToPredictions(user.uid, setPredictions);
    return () => unsubscribe();
  }, [user]);

  const isOwnProfile = !!user;

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        {/* Tabs */}
        <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">{vi.home.loading}</div>
        )}

        {error && (
          <div className="text-center text-red-400">{vi.home.error}: {error}</div>
        )}

        {matches && (
          <>
            {activeTab === 'schedule' ? (
              <>
                {/* Live matches section */}
                <LiveMatches
                  matches={matches}
                />

                {/* Next upcoming match only */}
                <UpcomingMatches
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={user?.uid}
                  predictions={predictions}
                />

                {/* All matches by day (excluding live and next match) */}
                <MatchesByDay
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={user?.uid}
                  predictions={predictions}
                  excludeLive={true}
                  excludeNextMatch={true}
                />
              </>
            ) : (
              /* Recent results tab */
              <RecentResults
                matches={matches}
                isOwnProfile={isOwnProfile}
                userId={user?.uid}
                predictions={predictions}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
