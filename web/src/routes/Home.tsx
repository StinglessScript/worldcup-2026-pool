import React from 'react';
import {
  AppLayout,
  LiveMatches,
  MatchesByGroup,
  RecentResults,
  UpcomingMatches,
} from '../components';
import { useMatches, useAuth } from '../hooks';
import { vi } from '../i18n';

export const Home = () => {
  const { matches, loading, error } = useMatches();
  const { user } = useAuth();

  // Hide splash once data is loaded
  React.useEffect(() => {
    if (!loading && (matches || error)) {
      window.hideSplash?.();
    }
  }, [loading, matches, error]);

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">{vi.home.loading}</div>
        )}

        {error && (
          <div className="text-center text-red-400">{vi.home.error}: {error}</div>
        )}

        {matches && (
          <>
            {/* Live matches section */}
            <LiveMatches
              matches={matches}
              isOwnProfile={false}
            />

            {/* Upcoming matches section */}
            {user && (
              <UpcomingMatches
                matches={matches}
                isOwnProfile={false}
              />
            )}

            {/* Recent results section */}
            <RecentResults
              matches={matches}
              isOwnProfile={false}
            />

            <MatchesByGroup matches={matches} />
          </>
        )}
      </div>
    </AppLayout>
  );
};
