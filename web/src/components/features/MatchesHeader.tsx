import { Chip } from '../ui/Chip';
import { vi } from '../../i18n';

type ViewMode = 'groupStage' | 'knockout';

type MatchesHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  title?: string;
};

export const MatchesHeader = ({
  viewMode,
  onViewModeChange,
  title = vi.home.title,
}: MatchesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold leading-none">{title}</h2>
      <div className="flex items-center gap-2">
        <Chip
          active={viewMode === 'groupStage'}
          onClick={() => onViewModeChange('groupStage')}
        >
          {vi.matchesHeader.groupStage}
        </Chip>
        <Chip
          active={viewMode === 'knockout'}
          onClick={() => onViewModeChange('knockout')}
        >
          {vi.matchesHeader.knockoutStage}
        </Chip>
      </div>
    </div>
  );
};
