import React from 'react';
import { createPortal } from 'react-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { useLeague } from '../../hooks/useLeague';
import { subscribeToLeaderboard, type UserWithId } from '../../services';
import { getPositionCompact } from '../../utils';
import { Button, ProfilePicture } from '../ui';

const menuItemClass =
  'w-full px-3 py-2.5 text-left text-white/80 hover:text-white hover:bg-white/[0.06] transition-all duration-150 cursor-pointer flex items-center gap-2.5 rounded-md text-[13px]';

const dividerClass = 'border-t border-white/[0.06] my-1';

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

  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

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

  if (!user) {
    return (
      <Button
        onClick={handleSignIn}
        className={mobile ? 'text-xs' : 'w-full text-[13px]'}
      >
        {mobile ? 'Đăng nhập' : 'Đăng nhập với Google'}
      </Button>
    );
  }

  return (
    <div ref={buttonRef} className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${mobile ? 'gap-x-2 p-0! pr-2! border border-white/[0.06] rounded-md bg-white/[0.04]' : `w-full gap-2.5 justify-start px-3! py-2! border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-150 ${isOpen ? 'rounded-t-md rounded-b-none border-b-0' : 'rounded-md'}`}`}
      >
        {!mobile && userData && (
          <>
            <ProfilePicture
              src={userData.photoURL}
              name={userData.displayName}
              size="sm"
              className="border-0 rounded-md"
            />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-white text-[13px] font-medium truncate">
                {userData.displayName}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <span>
                  Điểm <span className="text-white/70 font-medium">{userData.score}</span>
                </span>
                {position !== null && (
                  <>
                    <span className="text-white/15">|</span>
                    <span>
                      Hạng <span className="text-white/70 font-medium">{getPositionCompact(position)}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
        {mobile && userData && (
          <>
            <ProfilePicture
              src={userData.photoURL}
              name={userData.displayName}
              size="sm"
              className="border-0 rounded-md"
            />
            {position !== null && (
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Hạng</span>
                <span className="text-white font-medium text-sm">
                  {getPositionCompact(position)}
                </span>
              </div>
            )}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`ml-auto text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </Button>
      {isOpen &&
        (() => {
          const menuContent = (
            <>
              {!mobile && (
                <li>
                  <Link
                    to="/leagues"
                    onClick={closeMenu}
                    className={menuItemClass}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                    <span>Giải đấu</span>
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/edit-profile"
                  onClick={closeMenu}
                  className={menuItemClass}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  <span>Sửa hồ sơ</span>
                </Link>
              </li>
              <li className={dividerClass} />
              {mobile && (
                <>
                  <li>
                    <Link
                      to="/rules"
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" x2="8" y1="13" y2="13" />
                        <line x1="16" x2="8" y1="17" y2="17" />
                        <line x1="10" x2="8" y1="9" y2="9" />
                      </svg>
                      <span>Luật chơi</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      <span>Giới thiệu</span>
                    </Link>
                  </li>
                  <li className={dividerClass} />
                </>
              )}
              <li>
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  className={menuItemClass}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </li>
            </>
          );

          return mobile ? (
            createPortal(
              <ul
                ref={dropdownRef}
                className="p-1.5 fixed left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl z-50"
                style={{ top: 'calc(env(safe-area-inset-top) + 57px)' }}
              >
                {menuContent}
              </ul>,
              document.body
            )
          ) : (
            <ul
              ref={dropdownRef}
              className="p-1.5 w-full backdrop-blur-xl bg-black/60 border border-white/[0.06] border-t-0 rounded-b-xl"
            >
              {menuContent}
            </ul>
          );
        })()}
    </div>
  );
};
