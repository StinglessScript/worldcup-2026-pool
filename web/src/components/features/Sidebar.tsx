import { Link, NavLink } from 'react-router-dom';
import { worldcupLogo, sidebarMenuBg } from '../../assets';
import { useAuth, useLeague } from '../../hooks';
import { Card } from '../ui/Card';
import { LeaderboardList } from './LeaderboardList';
import { LeaguePicture } from './LeaguePicture';
import { UserMenu } from './UserMenu';

export const Sidebar = () => {
  const { user, userData } = useAuth();
  const { selectedLeague } = useLeague();

  return (
    <aside className="w-72 shrink-0 p-4 h-screen sticky top-0">
      <Card className="h-full max-h-[calc(100vh-2rem)] flex flex-col rounded-xl after:hidden overflow-hidden border border-white/[0.06]">
        {/* Logo Section */}
        <div className="relative overflow-hidden">
          <img
            src={sidebarMenuBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          <Link
            to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
            className="relative z-10 flex items-center justify-center py-5 hover:opacity-90 transition-opacity duration-200"
          >
            {selectedLeague ? (
              <div className="flex flex-col items-center gap-2">
                <LeaguePicture
                  src={selectedLeague.imageURL}
                  name={selectedLeague.name}
                  size="lg"
                  className="h-16 w-16 rounded-lg"
                />
                <span className="text-white/90 text-xs font-medium tracking-wide uppercase">
                  {selectedLeague.name}
                </span>
              </div>
            ) : (
              <img
                src={worldcupLogo}
                alt="World Cup 2026"
                className="h-16 drop-shadow-sm"
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="px-3 py-3 space-y-1 border-b border-white/[0.06]">
          {user && userData && (
            <NavLink
              to={`/${userData.userName}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/[0.04]'
                }`
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>Dự đoán</span>
            </NavLink>
          )}
          <UserMenu />
        </div>

        {/* Leaderboard */}
        <div className="flex-1 min-h-0 flex flex-col">
          <LeaderboardList />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-center gap-4 text-[11px]">
            <Link
              to="/rules"
              className="text-white/30 hover:text-white/60 transition-colors duration-150 tracking-wide uppercase"
            >
              Luật chơi
            </Link>
            <span className="text-white/10">|</span>
            <Link
              to="/about"
              className="text-white/30 hover:text-white/60 transition-colors duration-150 tracking-wide uppercase"
            >
              Giới thiệu
            </Link>
          </div>
        </div>
      </Card>
    </aside>
  );
};
