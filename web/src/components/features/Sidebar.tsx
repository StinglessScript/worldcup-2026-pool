import { Link, NavLink } from 'react-router-dom';
import { worldcupLogo, sidebarMenuBg } from '../../assets';
import { useAuth, useLeague } from '../../hooks';
import { vi } from '../../i18n';
import { Card } from '../ui/Card';
import { LeaderboardList } from './LeaderboardList';
import { LeaguePicture } from './LeaguePicture';
import { ProfilePicture } from '../ui';
import { getPositionCompact } from '../../utils';
import { subscribeToLeaderboard, type UserWithId } from '../../services';
import React from 'react';

const navItemClass =
  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors';
const navActiveClass = 'bg-white/15 text-white font-medium';
const navInactiveClass = 'text-white/60 hover:text-white hover:bg-white/5';

export const Sidebar = () => {
  const { user, userData } = useAuth();
  const { selectedLeague } = useLeague();
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);

  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard(setAllUsers);
    return () => unsubscribe();
  }, []);

  const position = React.useMemo(() => {
    if (!user) return null;
    const idx = allUsers.findIndex((u) => u.id === user.uid);
    return idx >= 0 ? idx + 1 : null;
  }, [user, allUsers]);

  const navItems = [
    {
      to: userData ? `/${userData.userName}` : '/',
      icon: '⚽',
      label: userData ? vi.nav.predictions : vi.nav.allMatches,
    },
    { to: '/rules', icon: '📋', label: vi.nav.rules },
  ];

  return (
    <aside className="w-64 shrink-0 p-3 h-screen sticky top-0">
      <Card className="h-full max-h-[calc(100vh-1.5rem)] flex flex-col rounded-xl after:hidden overflow-hidden">
        {/* Logo */}
        <div className="relative w-full flex flex-col overflow-hidden">
          <img
            src={sidebarMenuBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <Link
            to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
            className="relative z-10 flex items-center justify-center py-4 hover:opacity-90 transition-opacity"
          >
            {selectedLeague ? (
              <div className="flex flex-col items-center gap-2">
                <LeaguePicture
                  src={selectedLeague.imageURL}
                  name={selectedLeague.name}
                  size="lg"
                  className="h-16 w-16 drop-shadow-lg"
                />
                <span className="text-white text-xs font-medium text-center px-2 truncate max-w-56">
                  {selectedLeague.name}
                </span>
              </div>
            ) : (
              <img
                src={worldcupLogo}
                alt="World Cup 2026"
                className="h-20 drop-shadow-lg"
              />
            )}
          </Link>
        </div>

        {/* User Profile Card */}
        {user && userData && (
          <Link
            to={`/${userData.userName}`}
            className="flex items-center gap-3 px-3 py-3 mx-2 mt-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ProfilePicture
              src={userData.photoURL}
              name={userData.displayName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {userData.displayName}
              </div>
              <div className="text-white/50 text-xs">
                {vi.userMenu.score}: {userData.score}
              </div>
            </div>
            {position && (
              <div className="text-right">
                <div className="text-white/40 text-[10px] uppercase">{vi.userMenu.rank}</div>
                <div className="text-white font-semibold text-sm">
                  {getPositionCompact(position)}
                </div>
              </div>
            )}
          </Link>
        )}

        {/* Navigation */}
        <nav className="px-2 py-3 gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${navItemClass} ${isActive ? navActiveClass : navInactiveClass}`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Leaderboard - scrollable */}
        <div className="flex-1 min-h-0 flex flex-col border-t border-white/10 overflow-hidden">
          <div className="flex-1 min-h-0 pt-2 pb-2">
            <LeaderboardList />
          </div>
        </div>
      </Card>
    </aside>
  );
};
