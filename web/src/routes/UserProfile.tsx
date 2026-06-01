import React from 'react';
import { useParams } from 'react-router-dom';
import {
  AppLayout,
  MatchesByGroup,
  MatchesHeader,
  UpcomingMatches,
  UserHeader,
} from '../components';
import { useMatches, useAuth } from '../hooks';
import { vi } from '../i18n';
import {
  type UserPredictions,
  subscribeToPredictions,
  getUserByUsername,
} from '../services';

type ViewMode = 'groupStage' | 'knockout';

export const UserProfile = () => {
  const { userName } = useParams();
  const { matches, loading: matchesLoading, error } = useMatches();
  const { user, userData } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>('groupStage');
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [profileUserId, setProfileUserId] = React.useState<string | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  // Determine if viewing own profile
  const isOwnProfile = userData?.userName === userName;

  // Reset state when userName changes to prevent stale data flash
  React.useEffect(() => {
    setProfileLoading(true);
    setProfileUserId(null);
    setPredictions({});
  }, [userName]);

  // Get the user ID for the profile being viewed
  React.useEffect(() => {
    if (isOwnProfile && user) {
      setProfileUserId(user.uid);
      setProfileLoading(false);
    } else if (userName) {
      // Fetch the user ID by username for viewing others' profiles
      getUserByUsername(userName)
        .then((profileUser) => {
          setProfileUserId(profileUser?.id ?? null);
        })
        .catch(console.error)
        .finally(() => setProfileLoading(false));
    }
  }, [userName, isOwnProfile, user]);

  // Subscribe to predictions for the profile being viewed
  React.useEffect(() => {
    if (!profileUserId) return;

    const unsubscribe = subscribeToPredictions(profileUserId, setPredictions);
    return () => unsubscribe();
  }, [profileUserId]);

  const loading = profileLoading || matchesLoading;

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center text-white/70 py-20">{vi.profile.loading}</div>
        ) : (
          <>
            {profileUserId && (
              <UserHeader
                userId={profileUserId}
                className="mb-8 border-b border-white/10 pb-8"
              />
            )}

            <MatchesHeader
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              title={vi.profile.predictions}
            />

            {error && (
              <div className="text-center text-red-400">{vi.common.error}: {error}</div>
            )}

            {matches && (
              <>
                {/* Upcoming matches section */}
                {isOwnProfile && (
                  <UpcomingMatches
                    matches={matches}
                    isOwnProfile={isOwnProfile}
                    userId={profileUserId ?? undefined}
                    predictions={predictions}
                  />
                )}

                <MatchesByGroup
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={profileUserId ?? undefined}
                  predictions={predictions}
                  filter={viewMode}
                />
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
