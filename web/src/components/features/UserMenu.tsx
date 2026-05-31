import React from 'react';
import { createPortal } from 'react-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { useLeague } from '../../hooks/useLeague';
import { vi } from '../../i18n';
import { subscribeToLeaderboard, type UserWithId } from '../../services';
import { getPositionCompact } from '../../utils';
import { Button, ProfilePicture } from '../ui';

const menuItemClass =
  'w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-3 rounded-lg text-sm';

const dividerClass = 'border-t border-white/10 my-1';

type UserMenuProps = {
  mobile?: boolean;
};

export const UserMenu = ({ mobile = false }: UserMenuProps) => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { selectedLeague, leagueMemberIds } = useLeague();
  const [isOpen, setIsOpen] = React.useState(false);
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLUListElement>(null);
  const justSignedIn = React.useRef(false);

  // Subscribe to leaderboard
  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // Calculate position based on selected league
  const position = React.useMemo(() => {
    if (!user) return null;

    if (selectedLeague && leagueMemberIds.length > 0) {
      const leagueUsers = allUsers.filter((u) =>
        leagueMemberIds.includes(u.id)
      );
      const idx = leagueUsers.findIndex((u) => u.id === user.uid);
      if (idx === -1) return null;
      return idx + 1;
    }

    const idx = allUsers.findIndex((u) => u.id === user.uid);
    return idx >= 0 ? idx + 1 : null;
  }, [user, allUsers, selectedLeague, leagueMemberIds]);

  // Navigate to user profile after sign-in
  React.useEffect(() => {
    if (justSignedIn.current && userData?.userName) {
      justSignedIn.current = false;
      void navigate(`/${userData.userName}`);
    }
  }, [userData, navigate]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        void navigate('/');
      })
      .catch(console.error);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideButton =
        buttonRef.current && !buttonRef.current.contains(target);
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);

      if (clickedOutsideButton && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const handleSignIn = () => {
    justSignedIn.current = true;
    signInWithPopup(auth, googleProvider).catch((error) => {
      justSignedIn.current = false;
      console.error(error);
    });
  };

  // Show sign in button if not authenticated
  if (!user) {
    return (
      <Button onClick={handleSignIn} className={mobile ? 'text-xs' : 'w-full'}>
        {mobile ? vi.nav.signIn : vi.nav.signInGoogle}
      </Button>
    );
  }

  return (
    <div ref={buttonRef} className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${mobile ? 'gap-x-2 p-0! pr-2! border border-black/10 rounded-lg bg-white/10' : `w-full gap-3 justify-start px-3! py-2.5! border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all ${isOpen ? 'rounded-t-xl rounded-b-none border-b-0' : 'rounded-xl'}`}`}
      >
        {!mobile && userData && (
          <>
            <ProfilePicture
              src={userData.photoURL}
              name={userData.displayName}
              size="md"
              className="border-0 rounded-xl"
            />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-white font-medium text-sm truncate">
                {userData.displayName}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50">
                  {vi.userMenu.score}: <span className="text-white font-semibold">{userData.score}</span>
                </span>
                {position !== null && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-white/50">
                      {vi.userMenu.rank}: <span className="text-white font-semibold">{getPositionCompact(position)}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            <span
              className={`text-white/40 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </>
        )}
        {mobile && userData && (
          <>
            <ProfilePicture
              src={userData.photoURL}
              name={userData.displayName}
              size="sm"
              className="border-0 rounded-lg rounded-r-none"
            />
            {position !== null && (
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-white/50 text-[10px] uppercase">{vi.userMenu.rank}</span>
                <span className="text-white font-semibold text-sm">
                  {getPositionCompact(position)}
                </span>
              </div>
            )}
            <span
              className={`ml-auto text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              ▾
            </span>
          </>
        )}
      </Button>
      {isOpen &&
        (() => {
          const menuContent = (
            <>
              {/* Navigation Items (desktop only) */}
              {!mobile && (
                <>
                  <li>
                    <Link
                      to={`/${userData?.userName}`}
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <span className="text-base">⚽</span> {vi.nav.predictions}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/leagues"
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <span className="text-base">🏆</span> {vi.nav.myLeagues}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/edit-profile"
                  onClick={closeMenu}
                  className={menuItemClass}
                >
                  <span className="text-base">✏️</span> {vi.nav.editProfile}
                </Link>
              </li>
              <li className={dividerClass} />
              {/* Info Links (mobile only) */}
              {mobile && (
                <>
                  <li>
                    <Link
                      to="/rules"
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <span className="text-base">📋</span> {vi.nav.rules}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <span className="text-base">ℹ️</span> {vi.nav.about}
                    </Link>
                  </li>
                  <li className={dividerClass} />
                </>
              )}
              {/* Sign Out */}
              <li>
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  className={menuItemClass}
                >
                  <span className="text-base">👋</span> {vi.nav.signOut}
                </button>
              </li>
            </>
          );

          return mobile ? (
            createPortal(
              <ul
                ref={dropdownRef}
                className="p-2 fixed left-0 right-0 bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-xl z-50"
                style={{ top: 'calc(env(safe-area-inset-top) + 57px)' }}
              >
                {menuContent}
              </ul>,
              document.body
            )
          ) : (
            <ul
              ref={dropdownRef}
              className="p-2 w-full backdrop-blur-2xl bg-black/40 border border-white/10 border-t-0 rounded-b-xl"
            >
              {menuContent}
            </ul>
          );
        })()}
    </div>
  );
};
