import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useLeague } from '../../hooks';
import { vi } from '../../i18n';
import { subscribeToLeaderboard, type UserWithId } from '../../services';
import { getPositionCompact } from '../../utils';
import { Card, ProfilePicture } from '../ui';
import { LeaguePicture } from './LeaguePicture';
import { Podium } from './Podium';
import appIcon from '/app-icon.png';

type LeaderboardProps = {
  variant?: 'compact' | 'full';
  users?: UserWithId[];
  onRemoveMember?: (userId: string, displayName: string) => void;
};

const UserRow = ({
  user,
  position,
  isCurrentUser,
  compact,
  onRemove,
}: {
  user: UserWithId;
  position: number;
  isCurrentUser: boolean;
  compact: boolean;
  onRemove?: () => void;
}) => (
  <div
    className={`flex items-center gap-2 rounded-md transition-all duration-150 px-2 py-1.5 ${
      isCurrentUser
        ? 'border border-white/[0.12] bg-white/[0.06]'
        : 'hover:bg-white/[0.03]'
    }`}
  >
    <Link
      to={`/${user.userName}`}
      className="flex items-center gap-2 flex-1 min-w-0"
    >
      <span
        className={`text-center text-white/30 font-mono ${compact ? 'w-6 text-[11px]' : 'w-8 text-xs'}`}
      >
        {getPositionCompact(position)}
      </span>
      <ProfilePicture
        src={user.photoURL}
        name={user.displayName}
        size={compact ? 'xs' : 'sm'}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`text-white/90 truncate ${compact ? 'text-[13px]' : 'text-sm font-medium'}`}
        >
          {user.displayName}
        </div>
        {!compact && (
          <div className="text-white/30 text-xs">@{user.userName}</div>
        )}
      </div>
      <span
        className={`text-white/50 font-medium tabular-nums ${compact ? 'text-[13px]' : 'text-sm'}`}
      >
        {user.score}
        {!compact && <span className="text-white/25 text-xs ml-0.5">đ</span>}
      </span>
    </Link>
    {onRemove && (
      <button
        onClick={onRemove}
        className="p-1 text-white/20 rounded hover:cursor-pointer hover:text-white/50 transition-colors"
        title="Xóa khỏi giải"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    )}
  </div>
);

export const LeaderboardList = ({
  variant = 'compact',
  users: externalUsers,
  onRemoveMember,
}: LeaderboardProps) => {
  const { user: currentUser } = useAuth();
  const { leagues, selectedLeague, setSelectedLeague, leagueMemberIds } =
    useLeague();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnLeaguePage = location.pathname.startsWith('/league/');
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const [loading, setLoading] = React.useState(!externalUsers);
  const [showTopFade, setShowTopFade] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subscribe to global leaderboard
  React.useEffect(() => {
    if (externalUsers) return;

    const unsubscribe = subscribeToLeaderboard((data) => {
      setAllUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [externalUsers]);

  // Filter users by league if selected
  const users = React.useMemo(() => {
    if (externalUsers) return externalUsers;
    if (!selectedLeague || leagueMemberIds.length === 0) return allUsers;
    return allUsers.filter((user) => leagueMemberIds.includes(user.id));
  }, [externalUsers, selectedLeague, leagueMemberIds, allUsers]);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowTopFade(scrollRef.current.scrollTop > 10);
    }
  };

  if (loading) {
    return (
      <div className="text-white/50 text-sm text-center py-4">{vi.leaderboard.loading}</div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-white/50 text-sm text-center py-4">
        {vi.leaderboard.noPlayers}
      </div>
    );
  }

  const isCompact = variant === 'compact';

  // Split users for podium display (full variant only)
  const podiumUsers = !isCompact && users.length >= 3 ? users.slice(0, 3) : [];
  const restUsers = !isCompact && users.length >= 3 ? users.slice(3) : users;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isCompact &&
        (leagues.length > 0 ? (
          <div ref={dropdownRef} className="relative px-3 mb-1.5">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between text-white/40 text-[11px] font-medium uppercase tracking-widest hover:text-white/60 transition-colors duration-150"
            >
              {selectedLeague ? selectedLeague.name : 'Bảng xếp hạng'}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdownOpen && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl border border-white/[0.06] rounded-md overflow-hidden z-20">
                <li>
                  <button
                    onClick={() => {
                      setSelectedLeague(null);
                      setDropdownOpen(false);
                      if (isOnLeaguePage) {
                        void navigate('/leagues');
                      }
                    }}
                    className={`w-full px-3 py-2 text-left text-[13px] hover:bg-white/[0.06] transition-colors flex items-center gap-2 ${!selectedLeague ? 'text-white bg-white/[0.04]' : 'text-white/60'}`}
                  >
                    <img
                      src={appIcon}
                      alt="Global"
                      className="w-8 h-8 rounded-md object-cover"
                    />
                    <span className="flex-1 truncate">World Cup 2026</span>
                    {!selectedLeague && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
                {leagues.map((league) => (
                  <li key={league.id}>
                    <button
                      onClick={() => {
                        setSelectedLeague(league);
                        setDropdownOpen(false);
                        if (isOnLeaguePage) {
                          void navigate(`/league/${league.slug}`);
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-[13px] hover:bg-white/[0.06] transition-colors flex items-center gap-2 ${selectedLeague?.id === league.id ? 'text-white bg-white/[0.04]' : 'text-white/60'}`}
                    >
                      <LeaguePicture
                        src={league.imageURL}
                        name={league.name}
                        size="sm"
                        className="w-6 h-6 rounded-md"
                      />
                      <span className="flex-1 truncate">{league.name}</span>
                      {selectedLeague?.id === league.id && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <h3 className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-1.5 px-3">
            Bảng xếp hạng
          </h3>
        ))}
      {/* Podium for full variant */}
      {!isCompact && <Podium users={podiumUsers} />}

      {/* User list */}
      {isCompact ? (
        <div className="relative flex-1 min-h-0">
          <div
            className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
              showTopFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex flex-col overflow-y-auto h-full gap-y-0.5 px-1.5 pb-4"
          >
            {users.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                position={index + 1}
                isCurrentUser={currentUser?.uid === user.id}
                compact
                onRemove={
                  onRemoveMember
                    ? () => onRemoveMember(user.id, user.displayName)
                    : undefined
                }
              />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black to-transparent pointer-events-none" />
        </div>
      ) : (
        <Card className="p-4">
          <div className="flex flex-col gap-1">
            {restUsers.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                position={users.length >= 3 ? index + 4 : index + 1}
                isCurrentUser={currentUser?.uid === user.id}
                compact={false}
                onRemove={
                  onRemoveMember
                    ? () => onRemoveMember(user.id, user.displayName)
                    : undefined
                }
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
