import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Bookmark, X, Inbox, User, LogOut, PackageCheck, ChevronDown, Trash2, UserX, Bell, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenDeleteAccountModal: () => void;
  onSwitchToAdminConsole?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPostModal: () => void;
  savedCount: number;
  showSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  myPostsCount: number;
  showMyPostsOnly: boolean;
  onToggleMyPosts: () => void;
  pendingRequestsCount: number;
  onOpenRequestsModal: () => void;
  unreadNotificationsCount: number;
  onToggleNotifications: () => void;
  isNotificationsOpen: boolean;
  notificationsDropdown?: React.ReactNode;
  totalListingsCount: number;
}

export function Header({
  currentUser,
  onLogout,
  onOpenDeleteAccountModal,
  onSwitchToAdminConsole,
  searchQuery,
  onSearchChange,
  onOpenPostModal,
  savedCount,
  showSavedOnly,
  onToggleSavedOnly,
  myPostsCount,
  showMyPostsOnly,
  onToggleMyPosts,
  pendingRequestsCount,
  onOpenRequestsModal,
  unreadNotificationsCount,
  onToggleNotifications,
  isNotificationsOpen,
  notificationsDropdown,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown and notif dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        if (isNotificationsOpen) {
          onToggleNotifications();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen, onToggleNotifications]);

  const initials = currentUser
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CS';

  return (
    <header className="h-16 bg-indigo-900 flex items-center justify-between px-4 sm:px-6 shrink-0 border-b border-indigo-800 shadow-md sticky top-0 z-30">
      {/* Brand & Logo */}
      <div 
        onClick={() => {
          if (showMyPostsOnly) onToggleMyPosts();
          if (showSavedOnly) onToggleSavedOnly();
        }}
        className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        title="CampusShare Home"
      >
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black italic tracking-tighter text-sm shadow-xs">
          CS
        </div>
        <div className="hidden sm:block">
          <h1 className="text-white text-lg font-bold tracking-tight leading-tight">
            Campus<span className="text-indigo-300">Share</span>
          </h1>
          <p className="text-[10px] text-indigo-300 font-mono leading-none">
            {currentUser ? `ID: ${currentUser.campusId}` : 'Verified Marketplace'}
          </p>
        </div>
      </div>

      {/* High Density Integrated Search Bar */}
      <div className="flex-1 max-w-lg px-2 sm:px-6">
        <div className="relative">
          <div className="absolute left-3 top-2.5 text-indigo-300 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search textbooks, tutors, or study groups..."
            className="w-full bg-indigo-800/50 border border-indigo-700 text-indigo-100 placeholder-indigo-300 rounded-lg py-2 pl-9 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-indigo-800/80 text-xs sm:text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-indigo-300 hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Admin Console Switcher Button if currentUser is admin */}
        {(currentUser?.role === 'admin' || currentUser?.isAdmin) && onSwitchToAdminConsole && (
          <button
            id="header-admin-console-btn"
            onClick={onSwitchToAdminConsole}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-sm transition-all cursor-pointer animate-pulse"
            title="Open Master Database Console"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Console</span>
          </button>
        )}

        {/* My Uploaded Posts Column Toggle Button */}
        <button
          id="header-my-posts-btn"
          onClick={onToggleMyPosts}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            showMyPostsOnly
              ? 'bg-indigo-600 text-white border-indigo-300 shadow-xs'
              : 'text-indigo-200 hover:text-white bg-indigo-800/40 hover:bg-indigo-800/80 border-indigo-700/60'
          }`}
          title="View all your uploaded listings"
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">My Posts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-indigo-900 font-bold">
            {myPostsCount}
          </span>
        </button>

        {/* Inbox / Requests with Badge */}
        <button
          id="header-requests-btn"
          onClick={onOpenRequestsModal}
          className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border text-indigo-200 hover:text-white bg-indigo-800/40 hover:bg-indigo-800/80 border-indigo-700/60 transition-colors cursor-pointer"
          title="View Connection Requests & Notes"
        >
          <Inbox className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-indigo-950 font-extrabold animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative" ref={notifMenuRef}>
          <button
            id="header-notifications-btn"
            onClick={onToggleNotifications}
            className={`relative flex items-center justify-center p-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isNotificationsOpen
                ? 'bg-indigo-700 text-white border-indigo-500 shadow-xs'
                : 'text-indigo-200 hover:text-white bg-indigo-800/40 hover:bg-indigo-800/80 border-indigo-700/60'
            }`}
            title="Notifications (Approved/Declined updates)"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Render dropdown if open */}
          {isNotificationsOpen && notificationsDropdown}
        </div>

        {/* Saved Toggle */}
        <button
          id="header-saved-filter-btn"
          onClick={onToggleSavedOnly}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            showSavedOnly
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
              : 'text-indigo-200 hover:text-white bg-indigo-800/40 hover:bg-indigo-800/80 border-indigo-700/60'
          }`}
          title="Toggle saved listings"
        >
          <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-white' : ''}`} />
          <span className="hidden md:inline">Saved</span>
          {savedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-indigo-900 font-bold">
              {savedCount}
            </span>
          )}
        </button>

        {/* Post Item CTA */}
        <button
          id="header-post-item-btn"
          onClick={onOpenPostModal}
          className="bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">List Item</span>
        </button>

        {/* User Profile & Logout Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full bg-indigo-800/50 hover:bg-indigo-800 border border-indigo-700 transition-colors cursor-pointer"
            title="Student Account & Profile"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 rounded-full border border-indigo-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {initials}
            </div>
            <ChevronDown className="w-3 h-3 text-indigo-300" />
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              {currentUser && (
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                      ID: {currentUser.campusId}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {currentUser.department}
                    </span>
                  </div>
                </div>
              )}

              <div className="py-1">
                {(currentUser?.role === 'admin' || currentUser?.isAdmin) && onSwitchToAdminConsole && (
                  <button
                    id="menu-admin-console-btn"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchToAdminConsole();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center justify-between transition-colors cursor-pointer border-b border-rose-100"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>Admin Master Console</span>
                    </div>
                    <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-mono">
                      ROOT
                    </span>
                  </button>
                )}

                <button
                  id="menu-my-posts-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (!showMyPostsOnly) onToggleMyPosts();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-indigo-600" />
                    <span>My Uploaded Posts</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                    {myPostsCount}
                  </span>
                </button>

                <button
                  id="menu-requests-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenRequestsModal();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-indigo-600" />
                    <span>Inquiries &amp; Requests</span>
                  </div>
                  {pendingRequestsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 space-y-0.5">
                <button
                  id="logout-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Log Out (Switch Account)</span>
                </button>

                <button
                  id="header-delete-account-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenDeleteAccountModal();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Delete Account Permanently</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


