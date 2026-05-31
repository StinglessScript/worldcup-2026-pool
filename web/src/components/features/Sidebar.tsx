import { Link, NavLink } from 'react-router-dom';
import { worldcupLogo, sidebarMenuBg } from '../../assets';
import { useAuth, useLeague } from '../../hooks';
import { vi } from '../../i18n';
import { Card } from '../ui/Card';
import { LeaderboardList } from './LeaderboardList';
import { LeaguePicture } from './LeaguePicture';
import { UserMenu } from './UserMenu';

export const Sidebar = () => {
  const { user, userData } = useAuth();
  const { selectedLeague } = useLeague();

  return (
    <aside className="w-72 shrink-0 p-3 h-screen sticky top-0">
      <Card className="h-full max-h-[calc(100vh-1.5rem)] flex flex-col rounded-2xl after:hidden overflow-hidden border border-white/10">
        {/* Logo */}
        <div className="relative overflow-hidden">
          <img
            src={sidebarMenuBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <Link
            to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
            className="relative z-10 flex items-center justify-center py-4 hover:opacity-90 transition-opacity"
          >
            {selectedLeague ? (
              <LeaguePicture
                src={selectedLeague.imageURL}
                name={selectedLeague.name}
                size="lg"
                className="h-16 w-16 drop-shadow-lg"
              />
            ) : (
              <img
                src={worldcupLogo}
                alt="World Cup 2026"
                className="h-16 drop-shadow-lg"
              />
            )}
          </Link>
        </div>

        {/* Quick Nav + UserMenu */}
        <div className="px-3 py-2 space-y-2 bg-white/5 border-b border-white/10">
          {/* Predictions link - outside dropdown */}
          {user && userData && (
            <NavLink
              to={`/${userData.userName}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <span>⚽</span>
              <span>{vi.nav.predictions}</span>
            </NavLink>
          )}
          <UserMenu />
        </div>

        {/* Leaderboard */}
        <div className="flex-1 min-h-0 flex flex-col">
          <LeaderboardList />
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-white/10 bg-white/5">
          <div className="flex gap-3 justify-center text-[11px]">
            <Link
              to="/rules"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              {vi.nav.rules}
            </Link>
            <span className="text-white/15">·</span>
            <Link
              to="/about"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              {vi.nav.about}
            </Link>
          </div>
        </div>
      </Card>
    </aside>
  );
};
