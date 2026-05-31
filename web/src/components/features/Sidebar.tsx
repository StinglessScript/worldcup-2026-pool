import { Link } from 'react-router-dom';
import { worldcupLogo, sidebarMenuBg } from '../../assets';
import { useLeague } from '../../hooks';
import { vi } from '../../i18n';
import { Card } from '../ui/Card';
import { LeaderboardList } from './LeaderboardList';
import { LeaguePicture } from './LeaguePicture';
import { UserMenu } from './UserMenu';

export const Sidebar = () => {
  const { selectedLeague } = useLeague();

  return (
    <aside className="w-80 shrink-0 p-4 h-screen sticky top-0">
      <Card className="h-full max-h-[calc(100vh-2rem)] flex flex-col rounded-2xl after:hidden overflow-hidden border border-white/10">
        {/* Logo Section with gradient background */}
        <div className="relative w-full overflow-hidden">
          <img
            src={sidebarMenuBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          <Link
            to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
            className="relative z-10 flex items-center justify-center py-5 hover:opacity-90 transition-opacity"
          >
            {selectedLeague ? (
              <div className="flex flex-col items-center gap-2">
                <LeaguePicture
                  src={selectedLeague.imageURL}
                  name={selectedLeague.name}
                  size="lg"
                  className="h-20 w-20 drop-shadow-xl ring-2 ring-white/20"
                />
                <span className="text-white text-sm font-medium drop-shadow-lg">
                  {selectedLeague.name}
                </span>
              </div>
            ) : (
              <img
                src={worldcupLogo}
                alt="World Cup 2026"
                className="h-20 drop-shadow-xl"
              />
            )}
          </Link>
        </div>

        {/* User Menu Section */}
        <div className="px-3 py-3 bg-white/5 border-b border-white/10">
          <UserMenu />
        </div>

        {/* Leaderboard */}
        <div className="flex-1 min-h-0 flex flex-col pt-2">
          <LeaderboardList />
        </div>

        {/* Footer Links */}
        <div className="mt-auto p-3 border-t border-white/10 bg-white/5">
          <div className="flex gap-4 justify-center text-xs">
            <Link
              to="/rules"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              {vi.nav.rules}
            </Link>
            <span className="text-white/20">•</span>
            <Link
              to="/about"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              {vi.nav.about}
            </Link>
          </div>
        </div>
      </Card>
    </aside>
  );
};
