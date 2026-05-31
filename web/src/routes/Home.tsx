import React from 'react';
import {
  AppLayout,
  MatchesByGroup,
  MatchesHeader,
} from '../components';
import { useMatches } from '../hooks';
import { vi } from '../i18n';

type ViewMode = 'groupStage' | 'knockout';

export const Home = () => {
  const { matches, loading, error } = useMatches();
  const [viewMode, setViewMode] = React.useState<ViewMode>('groupStage');

  // Hide splash once data is loaded
  React.useEffect(() => {
    if (!loading && (matches || error)) {
      window.hideSplash?.();
    }
  }, [loading, matches, error]);

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        <MatchesHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">{vi.home.loading}</div>
        )}

        {error && (
          <div className="text-center text-red-400">{vi.home.error}: {error}</div>
        )}

        {matches && (
          <MatchesByGroup matches={matches} filter={viewMode} />
        )}
      </div>
    </AppLayout>
  );
};
