import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Listing, PillarCategory, ListingType, ConnectionRequest, UserAccount, UserNotification } from './types';
import { INITIAL_LISTINGS, INITIAL_CONNECTION_REQUESTS, DEFAULT_USERS } from './data/mockListings';
import { Header } from './components/Header';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { ListingCard } from './components/ListingCard';
import { PostItemModal } from './components/PostItemModal';
import { ConnectModal } from './components/ConnectModal';
import { RequestsModal } from './components/RequestsModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { NotificationPopup, NotificationDropdown } from './components/NotificationModal';
import { Toast } from './components/Toast';
import { EmptyState } from './components/EmptyState';
import { SmartMatchingBanner } from './components/SmartMatchingBanner';
import { AuthPage } from './components/AuthPage';
import { MyUploadedPostsColumn } from './components/MyUploadedPostsColumn';
import { AdminConsole } from './components/AdminConsole';

const LOCAL_STORAGE_KEY = 'campusshare_listings_v3';
const REQUESTS_STORAGE_KEY = 'campusshare_requests_v4';
const USERS_STORAGE_KEY = 'campusshare_users_v3';
const CURRENT_USER_KEY = 'campusshare_current_user_v3';
const NOTIFICATIONS_STORAGE_KEY = 'campusshare_notifications_v2';

export default function App() {
  // Load registered users from localStorage or default users
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USERS;
  });

  // Current logged in user (null triggers the Campus Login / Registration Page)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    // Default to the first campus user on initial load
    return DEFAULT_USERS[0];
  });

  // Admin view toggle ('console' vs 'marketplace')
  const [adminViewMode, setAdminViewMode] = useState<'console' | 'marketplace'>('console');

  // Save registered users
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  }, [registeredUsers]);

  // Save current user session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save current user to localStorage', e);
    }
  }, [currentUser]);

  // Load listings from localStorage or fallback to initial mock data
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_LISTINGS;
  });

  // Load connection requests
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(() => {
    try {
      const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_CONNECTION_REQUESTS;
  });

  // Load user notifications
  const [notifications, setNotifications] = useState<UserNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Save to localStorage when listings update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
      console.error('Failed to save listings to localStorage', e);
    }
  }, [listings]);

  // Save requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(connectionRequests));
    } catch (e) {
      console.error('Failed to save requests to localStorage', e);
    }
  }, [connectionRequests]);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  // Filtering & View states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PillarCategory | 'all'>('all');
  const [activeType, setActiveType] = useState<ListingType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);

  // Modals, Notifications & Popups
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeNotificationPopup, setActiveNotificationPopup] = useState<UserNotification | null>(null);
  const [connectListing, setConnectListing] = useState<Listing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Get current user's uploaded listings
  const myListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter(
      (l) =>
        l.userId === currentUser.id ||
        l.ownerCampusId === currentUser.campusId ||
        l.contactEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  }, [listings, currentUser]);

  // Notifications belonging to current user
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(
      (n) =>
        n.recipientUserId === currentUser.id ||
        n.recipientCampusId === currentUser.campusId ||
        (!n.recipientUserId && !n.recipientCampusId)
    );
  }, [notifications, currentUser]);

  const unreadNotificationsCount = useMemo(() => {
    return userNotifications.filter((n) => !n.read).length;
  }, [userNotifications]);

  // Pending incoming requests for user's own posts ONLY
  const pendingRequestsCount = useMemo(() => {
    if (!currentUser) return 0;
    return connectionRequests.filter(
      (r) => (r.ownerUserId === currentUser.id || (r.isIncoming && !r.ownerUserId)) && r.status === 'pending'
    ).length;
  }, [connectionRequests, currentUser]);

  // Counts for category tabs
  const categoryCounts = useMemo(() => {
    return {
      all: listings.length,
      resources: listings.filter((l) => l.category === 'resources').length,
      services: listings.filter((l) => l.category === 'services').length,
      opportunities: listings.filter((l) => l.category === 'opportunities').length,
    };
  }, [listings]);

  // Counts for offering vs looking_for
  const typeCounts = useMemo(() => {
    return {
      all: listings.length,
      offering: listings.filter((l) => l.type === 'offering').length,
      looking_for: listings.filter((l) => l.type === 'looking_for').length,
    };
  }, [listings]);

  // Extract popular tags
  const popularTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    listings.forEach((l) => {
      l.tags?.forEach((t) => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [listings]);

  const savedCount = useMemo(() => {
    return listings.filter((l) => l.saved).length;
  }, [listings]);

  // Filtered listings for general explore
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Saved filter
      if (showSavedOnly && !item.saved) return false;

      // Category tab filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Type filter (Offering vs Looking For)
      if (activeType !== 'all' && item.type !== activeType) {
        return false;
      }

      // Tag filter
      if (selectedTag && !item.tags?.includes(selectedTag)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(query);
        const inDesc = item.description.toLowerCase().includes(query);
        const inLoc = item.campusLocation.toLowerCase().includes(query);
        const inAuthor = item.contactName.toLowerCase().includes(query);
        const inTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        const inPrice = item.price.toLowerCase().includes(query);

        if (!inTitle && !inDesc && !inLoc && !inAuthor && !inTags && !inPrice) {
          return false;
        }
      }

      return true;
    });
  }, [listings, showSavedOnly, activeCategory, activeType, selectedTag, searchQuery]);

  // Handler: Open post item modal for creating new post
  const handleOpenPostModal = () => {
    setEditingListing(null);
    setIsPostModalOpen(true);
  };

  // Handler: Open post item modal for editing existing post
  const handleOpenEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setIsPostModalOpen(true);
  };

  // Handler: Save listing (handles both creating and editing)
  const handleSaveListing = (savedListing: Listing, isEditing?: boolean) => {
    if (isEditing) {
      setListings((prev) =>
        prev.map((item) => (item.id === savedListing.id ? savedListing : item))
      );
      setToastMessage(`"${savedListing.title}" updated successfully!`);
    } else {
      setListings((prev) => [savedListing, ...prev]);

      // Reset filters so the user sees their new post immediately
      setActiveCategory(savedListing.category);
      setActiveType('all');
      setSearchQuery('');
      setSelectedTag(null);
      setShowSavedOnly(false);

      setToastMessage(`"${savedListing.title}" posted successfully! Added to My Uploaded Posts.`);
    }
  };

  // Handler: Delete an uploaded listing
  const handleDeleteListing = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    setToastMessage('Listing removed from campus marketplace.');
  };

  // Handler: Toggle bookmark/saved state
  const handleToggleSave = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, saved: !item.saved } : item
      )
    );
  };

  // Handler: Initiate connect modal
  const handleOpenConnect = (listing: Listing) => {
    setConnectListing(listing);
  };

  // Handler: Send connection request with note and image upload
  const handleSendConnectRequest = (requestData: {
    listing: Listing;
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    note: string;
    attachmentImage?: string;
  }) => {
    const newRequest: ConnectionRequest = {
      id: `req-${Date.now()}`,
      listingId: requestData.listing.id,
      listingTitle: requestData.listing.title,
      listingCategory: requestData.listing.category,
      ownerUserId: requestData.listing.userId || 'user-1',
      ownerCampusId: requestData.listing.ownerCampusId || 'CAMPUS-101',
      senderUserId: currentUser.id,
      senderCampusId: currentUser.campusId,
      senderName: requestData.senderName,
      senderEmail: requestData.senderEmail,
      senderPhone: requestData.senderPhone,
      ownerName: requestData.listing.contactName,
      ownerEmail: requestData.listing.contactEmail,
      ownerPhone: requestData.listing.contactPhone,
      note: requestData.note,
      attachmentImage: requestData.attachmentImage,
      status: 'pending',
      createdAt: 'Just now',
      isIncoming: false,
    };

    setConnectionRequests((prev) => [newRequest, ...prev]);
    setToastMessage(`Note & request sent to ${requestData.listing.contactName}! Owner contact unlocks upon acceptance.`);
  };

  // Handler: Accept incoming connection request (sends notification without popup)
  const handleAcceptRequest = (requestId: string) => {
    const targetReq = connectionRequests.find((r) => r.id === requestId);

    setConnectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' as const } : r
      )
    );

    if (targetReq) {
      const notif: UserNotification = {
        id: `notif-${Date.now()}`,
        recipientUserId: targetReq.senderUserId || '',
        recipientCampusId: targetReq.senderCampusId,
        requestId: targetReq.id,
        listingId: targetReq.listingId,
        listingTitle: targetReq.listingTitle,
        listingCategory: targetReq.listingCategory,
        type: 'request_approved',
        title: `Request Accepted: ${targetReq.listingTitle}`,
        message: `${currentUser?.name || targetReq.ownerName} approved your connection request! Their contact phone and email are now unlocked.`,
        ownerName: currentUser?.name || targetReq.ownerName,
        ownerEmail: currentUser?.email || targetReq.ownerEmail,
        ownerPhone: currentUser?.phone || targetReq.ownerPhone,
        read: false,
        createdAt: 'Just now',
      };

      // Just send notification to inbox, no automatic popup
      setNotifications((prev) => [notif, ...prev]);
    }

    setToastMessage(`Connection accepted! Contact information shared with student.`);
  };

  // Handler: Decline incoming connection request (sends notification without popup)
  const handleDeclineRequest = (requestId: string) => {
    const targetReq = connectionRequests.find((r) => r.id === requestId);

    setConnectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'declined' as const } : r
      )
    );

    if (targetReq) {
      const notif: UserNotification = {
        id: `notif-${Date.now()}`,
        recipientUserId: targetReq.senderUserId || '',
        recipientCampusId: targetReq.senderCampusId,
        requestId: targetReq.id,
        listingId: targetReq.listingId,
        listingTitle: targetReq.listingTitle,
        listingCategory: targetReq.listingCategory,
        type: 'request_declined',
        title: `Request Declined: ${targetReq.listingTitle}`,
        message: `${currentUser?.name || targetReq.ownerName} declined the connection request for "${targetReq.listingTitle}".`,
        ownerName: currentUser?.name || targetReq.ownerName,
        read: false,
        createdAt: 'Just now',
      };

      // Just send notification to inbox, no automatic popup
      setNotifications((prev) => [notif, ...prev]);
    }

    setToastMessage('Connection request declined.');
  };

  // Handler: Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.recipientUserId === currentUser.id ||
        n.recipientCampusId === currentUser.campusId ||
        (!n.recipientUserId && !n.recipientCampusId)
          ? { ...n, read: true }
          : n
      )
    );
  };

  // Handler: Clear all notifications for user
  const handleClearAllNotifications = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.filter(
        (n) =>
          n.recipientUserId !== currentUser.id &&
          n.recipientCampusId !== currentUser.campusId &&
          (Boolean(n.recipientUserId) || Boolean(n.recipientCampusId))
      )
    );
  };

  // Handler: Select notification from dropdown
  const handleSelectNotification = (notif: UserNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);
    setActiveNotificationPopup(notif);
  };

  // Handler: Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveType('all');
    setSelectedTag(null);
    setShowSavedOnly(false);
  };

  // Handler: Register a new user
  const handleRegisterUser = (newUser: UserAccount) => {
    setRegisteredUsers((prev) => [newUser, ...prev]);
  };

  // Handler: Login Success
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.isAdmin) {
      setAdminViewMode('console');
      setToastMessage(`Welcome Administrator ${user.name}! Database Console opened.`);
    } else {
      setAdminViewMode('marketplace');
      setToastMessage(`Welcome to CampusShare, ${user.name}! (ID: ${user.campusId})`);
    }
  };

  // Handler: Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setShowMyPostsOnly(false);
    setShowSavedOnly(false);
    setToastMessage('Logged out. Please sign in with your Campus ID to continue.');
  };

  // Handler: Permanently Delete Account
  const handleDeleteAccount = (userId: string) => {
    if (!currentUser) return;
    const deletedName = currentUser.name;
    const deletedCampusId = currentUser.campusId;
    const deletedEmail = currentUser.email.toLowerCase();

    // 1. Remove from registered users
    const updatedUsers = registeredUsers.filter(
      (u) => u.id !== userId && u.campusId !== deletedCampusId
    );
    setRegisteredUsers(updatedUsers);

    // 2. Remove all listings uploaded by this user
    setListings((prev) =>
      prev.filter(
        (l) =>
          l.userId !== userId &&
          l.ownerCampusId !== deletedCampusId &&
          l.contactEmail.toLowerCase() !== deletedEmail
      )
    );

    // 3. Remove all requests sent to or by this user
    setConnectionRequests((prev) =>
      prev.filter(
        (r) =>
          r.ownerUserId !== userId &&
          r.ownerCampusId !== deletedCampusId &&
          r.senderUserId !== userId &&
          r.senderCampusId !== deletedCampusId
      )
    );

    // 4. Log out and purge session
    setCurrentUser(null);
    setShowMyPostsOnly(false);
    setShowSavedOnly(false);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Failed to clear user from localStorage', e);
    }

    // 5. Toast notification
    setToastMessage(`Account for ${deletedName} (${deletedCampusId}) has been permanently deleted.`);
  };

  // If no user is logged in, show the Campus Authentication screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          registeredUsers={registeredUsers}
          onRegisterUser={handleRegisterUser}
        />
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    );
  }

  // If logged in as Admin and in console view mode, render the Admin Master Database Console
  if ((currentUser.role === 'admin' || currentUser.isAdmin) && adminViewMode === 'console') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <AdminConsole
          currentUser={currentUser}
          users={registeredUsers}
          listings={listings}
          connectionRequests={connectionRequests}
          notifications={notifications}
          onUpdateUsers={setRegisteredUsers}
          onUpdateListings={setListings}
          onUpdateConnectionRequests={setConnectionRequests}
          onUpdateNotifications={setNotifications}
          onLogout={handleLogout}
          onSwitchToStudentView={() => setAdminViewMode('marketplace')}
          onResetToDefaults={() => {
            setRegisteredUsers(DEFAULT_USERS);
            setListings(INITIAL_LISTINGS);
            setConnectionRequests(INITIAL_CONNECTION_REQUESTS);
            setNotifications([]);
            setToastMessage('Database restored to factory mock defaults.');
          }}
        />
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    );
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    activeCategory !== 'all' ||
    activeType !== 'all' ||
    selectedTag !== null ||
    showSavedOnly;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner when Admin is Previewing the Marketplace */}
      {(currentUser.role === 'admin' || currentUser.isAdmin) && (
        <div className="bg-rose-950 text-rose-200 border-b border-rose-800/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner z-40 sticky top-0">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold text-rose-300">Master Admin Mode:</span>
            <span>You are previewing the student marketplace as {currentUser.name}.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminViewMode('console')}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              Return to Database Console
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* High Density Indigo Header with User Profile & My Posts Access */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenDeleteAccountModal={() => setIsDeleteAccountModalOpen(true)}
        onSwitchToAdminConsole={() => setAdminViewMode('console')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPostModal={handleOpenPostModal}
        savedCount={savedCount}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => {
          setShowSavedOnly((prev) => !prev);
          if (showMyPostsOnly) setShowMyPostsOnly(false);
        }}
        myPostsCount={myListings.length}
        showMyPostsOnly={showMyPostsOnly}
        onToggleMyPosts={() => {
          setShowMyPostsOnly((prev) => !prev);
          if (showSavedOnly) setShowSavedOnly(false);
        }}
        pendingRequestsCount={pendingRequestsCount}
        onOpenRequestsModal={() => setIsRequestsModalOpen(true)}
        totalListingsCount={listings.length}
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
        isNotificationsOpen={isNotificationsOpen}
        notificationsDropdown={
          <NotificationDropdown
            notifications={userNotifications}
            onMarkAllAsRead={handleMarkAllNotificationsRead}
            onClearAll={handleClearAllNotifications}
            onSelectNotification={handleSelectNotification}
            onClose={() => setIsNotificationsOpen(false)}
          />
        }
      />

      {/* Sub-Navigation & Filters */}
      <SearchBarAndFilters
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          if (showMyPostsOnly) setShowMyPostsOnly(false);
        }}
        activeType={activeType}
        onTypeChange={setActiveType}
        categoryCounts={categoryCounts}
        typeCounts={typeCounts}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        popularTags={popularTags}
        searchQuery={searchQuery}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Toggle between "My Uploaded Posts" column view and Marketplace explore */}
        {showMyPostsOnly ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>My Uploaded Listings Column</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {myListings.length} items
                  </span>
                </h2>
              </div>
              <button
                id="back-to-explore-btn"
                onClick={() => setShowMyPostsOnly(false)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back to All Explore
              </button>
            </div>

            <MyUploadedPostsColumn
              currentUser={currentUser}
              myListings={myListings}
              connectionRequests={connectionRequests}
              onOpenPostModal={handleOpenPostModal}
              onEditListing={handleOpenEditListing}
              onDeleteListing={handleDeleteListing}
              onOpenRequestsForListing={() => setIsRequestsModalOpen(true)}
              onViewListingDetails={handleOpenConnect}
            />
          </div>
        ) : (
          <div>
            {/* Banner Section */}
            <div className="mb-4">
              <SmartMatchingBanner
                activeCount={listings.length}
                onSelectCategory={(cat) => {
                  setActiveCategory(cat);
                }}
              />
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {showSavedOnly
                    ? 'Saved Listings'
                    : activeCategory === 'all'
                    ? 'All Campus Listings'
                    : activeCategory === 'resources'
                    ? 'Resources Marketplace'
                    : activeCategory === 'services'
                    ? 'Peer Services'
                    : 'Campus Opportunities'}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {filteredListings.length}
                </span>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Responsive High Density 3-Column Grid */}
            {filteredListings.length > 0 ? (
              <motion.div
                layout
                id="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {filteredListings.map((listing) => {
                    // Find if user already sent a request for this listing
                    const userRequest = connectionRequests.find(
                      (r) => r.listingId === listing.id && !r.isIncoming
                    );
                    const isOwner = Boolean(
                      currentUser && (
                        listing.userId === currentUser.id ||
                        listing.ownerCampusId === currentUser.campusId ||
                        listing.contactEmail.toLowerCase() === currentUser.email.toLowerCase()
                      )
                    );

                    return (
                      <motion.div
                        key={listing.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ListingCard
                          listing={listing}
                          isOwner={isOwner}
                          onEdit={handleOpenEditListing}
                          connectionStatus={userRequest?.status}
                          onConnect={handleOpenConnect}
                          onToggleSave={handleToggleSave}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState
                hasFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
                onOpenPostModal={handleOpenPostModal}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CampusShare</span>
            <span>•</span>
            <span>High Density Student Marketplace &amp; Opportunity Network</span>
          </div>
          <p>© 2026 CampusShare. Logged in as {currentUser.name} (ID: {currentUser.campusId})</p>
        </div>
      </footer>

      {/* Post an Item Modal (supports creating new & editing existing posts) */}
      <PostItemModal
        isOpen={isPostModalOpen}
        editingListing={editingListing}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingListing(null);
        }}
        onSubmit={handleSaveListing}
        currentUser={currentUser}
      />

      {/* Connect Details Modal (protected until owner accepts or direct public channels) */}
      <ConnectModal
        listing={connectListing}
        currentUser={currentUser}
        existingRequest={
          connectListing
            ? connectionRequests.find(
                (r) => r.listingId === connectListing.id && (r.senderUserId === currentUser.id || !r.isIncoming)
              )
            : undefined
        }
        onClose={() => setConnectListing(null)}
        onEdit={handleOpenEditListing}
        onSendRequest={handleSendConnectRequest}
      />

      {/* Connection Requests Inbox Modal (owner-isolated privacy) */}
      <RequestsModal
        isOpen={isRequestsModalOpen}
        currentUser={currentUser}
        onClose={() => setIsRequestsModalOpen(false)}
        requests={connectionRequests}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
      />

      {/* Delete Account Permanently Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        currentUser={currentUser}
        userPostCount={myListings.length}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirmDelete={handleDeleteAccount}
      />

      {/* Notification Alert Popup for Approved/Declined Request status */}
      <NotificationPopup
        notification={activeNotificationPopup}
        onClose={() => setActiveNotificationPopup(null)}
      />

      {/* Success Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}



