type Tab = 'schedule' | 'results';

type MatchTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export const MatchTabs = ({ activeTab, onTabChange }: MatchTabsProps) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'schedule', label: 'Lịch đấu' },
    { id: 'results', label: 'Kết quả' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
