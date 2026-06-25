import React from 'react';
import {
  AppLayout,
  LiveMatches,
  MatchesByDay,
  MatchTabs,
  type Tab,
} from '../components';
import { useMatches, useAuth } from '../hooks';
import { vi } from '../i18n';
import { isLive, isFinished } from '../utils';
import {
  type UserPredictions,
  subscribeToPredictions,
} from '../services';

export const Home = () => {
  const { matches, loading, error } = useMatches();
  const { user } = useAuth();
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [activeTab, setActiveTab] = React.useState<Tab>('upcoming');

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

  // Count matches per category for tab badges and empty states
  const counts = React.useMemo(() => {
    const list = matches ? Object.values(matches) : [];
    let live = 0;
    let upcoming = 0;
    let finished = 0;
    list.forEach((match) => {
      if (isLive(match)) live += 1;
      else if (isFinished(match)) finished += 1;
      else upcoming += 1;
    });
    return { live, upcoming, finished };
  }, [matches]);

  const emptyMessage = (text: string) => (
    <div className="text-center text-white/40 py-12">{text}</div>
  );

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        {/* Tabs */}
        <MatchTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          liveCount={counts.live}
        />

        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">{vi.home.loading}</div>
        )}

        {error && (
          <div className="text-center text-red-400">{vi.home.error}: {error}</div>
        )}

        {matches && (
          <>
            {/* Live matches */}
            {activeTab === 'live' &&
              (counts.live > 0 ? (
                <LiveMatches
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={user?.uid}
                  predictions={predictions}
                />
              ) : (
                emptyMessage(vi.match.noLive)
              ))}

            {/* Upcoming (not yet played) matches, grouped by day */}
            {activeTab === 'upcoming' &&
              (counts.upcoming > 0 ? (
                <MatchesByDay
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={user?.uid}
                  predictions={predictions}
                  excludeLive={true}
                  excludeFinished={true}
                />
              ) : (
                emptyMessage(vi.match.noUpcoming)
              ))}

            {/* Finished matches */}
            {activeTab === 'finished' &&
              (counts.finished > 0 ? (
                <MatchesByDay
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={user?.uid}
                  predictions={predictions}
                  onlyFinished={true}
                  sortDescending={true}
                />
              ) : (
                emptyMessage(vi.match.noFinished)
              ))}
          </>
        )}
      </div>
    </AppLayout>
  );
};
