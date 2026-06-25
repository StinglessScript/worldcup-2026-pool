import { vi } from '../../i18n';

export type Tab = 'live' | 'upcoming' | 'finished';

type MatchTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  liveCount?: number;
};

export const MatchTabs = ({
  activeTab,
  onTabChange,
  liveCount = 0,
}: MatchTabsProps) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'live', label: vi.match.tabLive },
    { id: 'upcoming', label: vi.match.tabUpcoming },
    { id: 'finished', label: vi.match.tabFinished },
  ];

  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === tab.id
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          {tab.id === 'live' && liveCount > 0 && (
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
