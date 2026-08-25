import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Package,
  ArrowLeftRight,
  Bell,
  Trash2,
  Edit3,
  Plus,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building,
  Key,
  Shield,
  Layers,
  FileText,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Save,
  Send,
  SlidersHorizontal,
  Database
} from 'lucide-react';
import {
  Listing,
  ConnectionRequest,
  UserAccount,
  UserNotification,
  PillarCategory,
  ListingType,
  ContactVisibility
} from '../types';

interface AdminConsoleProps {
  currentUser: UserAccount;
  users: UserAccount[];
  listings: Listing[];
  connectionRequests: ConnectionRequest[];
  notifications: UserNotification[];
  onUpdateUsers: (users: UserAccount[]) => void;
  onUpdateListings: (listings: Listing[]) => void;
  onUpdateConnectionRequests: (requests: ConnectionRequest[]) => void;
  onUpdateNotifications: (notifications: UserNotification[]) => void;
  onSwitchToStudentView: () => void;
  onLogout: () => void;
  onResetToDefaults: () => void;
}

type AdminTab = 'overview' | 'users' | 'listings' | 'requests' | 'notifications' | 'maintenance';

export function AdminConsole({
  currentUser,
  users,
  listings,
  connectionRequests,
  notifications,
  onUpdateUsers,
  onUpdateListings,
  onUpdateConnectionRequests,
  onUpdateNotifications,
  onSwitchToStudentView,
  onLogout,
  onResetToDefaults,
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Search queries per tab
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [listingCategoryFilter, setListingCategoryFilter] = useState<'all' | PillarCategory>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [notificationSearch, setNotificationSearch] = useState('');

  // Editing Modals state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);

  // New Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | string>('all');
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  // Confirmation Delete State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'user' | 'listing' | 'request' | 'notification' | 'all_notifications';
    id: string;
    name: string;
  } | null>(null);

  // Success toast within Admin Console
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => {
      setAdminToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Telemetry Metrics
  const stats = useMemo(() => {
    const studentCount = users.filter((u) => u.role !== 'admin').length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const resourceCount = listings.filter((l) => l.category === 'resources').length;
    const serviceCount = listings.filter((l) => l.category === 'services').length;
    const oppCount = listings.filter((l) => l.category === 'opportunities').length;
    const pendingReqs = connectionRequests.filter((r) => r.status === 'pending').length;
    const acceptedReqs = connectionRequests.filter((r) => r.status === 'accepted').length;
    const declinedReqs = connectionRequests.filter((r) => r.status === 'declined').length;

    return {
      totalUsers: users.length,
      studentCount,
      adminCount,
      totalListings: listings.length,
      resourceCount,
      serviceCount,
      oppCount,
      totalRequests: connectionRequests.length,
      pendingReqs,
      acceptedReqs,
      declinedReqs,
      totalNotifications: notifications.length,
    };
  }, [users, listings, connectionRequests, notifications]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.campusId.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [users, userSearch]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch =
        listingSearch === '' ||
        l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.description.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.contactName.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.tags.some((t) => t.toLowerCase().includes(listingSearch.toLowerCase()));
      const matchesCategory =
        listingCategoryFilter === 'all' || l.category === listingCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [listings, listingSearch, listingCategoryFilter]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return connectionRequests.filter((r) => {
      const q = requestSearch.toLowerCase();
      const matchesSearch =
        q === '' ||
        r.listingTitle.toLowerCase().includes(q) ||
        r.senderName.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.note.toLowerCase().includes(q);
      const matchesStatus =
        requestStatusFilter === 'all' || r.status === requestStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [connectionRequests, requestSearch, requestStatusFilter]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const q = notificationSearch.toLowerCase();
      return (
        q === '' ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.recipientCampusId && n.recipientCampusId.toLowerCase().includes(q))
      );
    });
  }, [notifications, notificationSearch]);

  // --- ACTIONS ---

  // Permanently delete user
  const handleExecuteDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) return;

    // Delete user
    onUpdateUsers(users.filter((u) => u.id !== userId));

    // Cascade delete user's listings
    const remainingListings = listings.filter(
      (l) => l.userId !== userId && l.ownerCampusId !== userToDelete.campusId
    );
    onUpdateListings(remainingListings);

    // Cascade delete user's connection requests
    const remainingRequests = connectionRequests.filter(
      (r) =>
        r.senderUserId !== userId &&
        r.ownerUserId !== userId &&
        r.senderCampusId !== userToDelete.campusId &&
        r.ownerCampusId !== userToDelete.campusId
    );
    onUpdateConnectionRequests(remainingRequests);

    // Cascade delete notifications
    onUpdateNotifications(
      notifications.filter(
        (n) => n.recipientUserId !== userId && n.recipientCampusId !== userToDelete.campusId
      )
    );

    setDeleteConfirmTarget(null);
    triggerToast(`User "${userToDelete.name}" and all associated records permanently purged.`);
  };

  // Permanently delete listing
  const handleExecuteDeleteListing = (listingId: string) => {
    const targetListing = listings.find((l) => l.id === listingId);
    onUpdateListings(listings.filter((l) => l.id !== listingId));
    // Cascade delete connection requests tied to this listing
    onUpdateConnectionRequests(connectionRequests.filter((r) => r.listingId !== listingId));
    setDeleteConfirmTarget(null);
    triggerToast(`Listing "${targetListing?.title || listingId}" permanently deleted.`);
  };

  // Permanently delete connection request
  const handleExecuteDeleteRequest = (requestId: string) => {
    onUpdateConnectionRequests(connectionRequests.filter((r) => r.id !== requestId));
    setDeleteConfirmTarget(null);
    triggerToast(`Connection request record permanently deleted.`);
  };

  // Override connection request status
  const handleOverrideRequestStatus = (
    requestId: string,
    newStatus: 'pending' | 'accepted' | 'declined'
  ) => {
    onUpdateConnectionRequests(
      connectionRequests.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
    triggerToast(`Request status updated to ${newStatus.toUpperCase()}`);
  };

  // Delete notification
  const handleExecuteDeleteNotification = (notifId: string) => {
    onUpdateNotifications(notifications.filter((n) => n.id !== notifId));
    setDeleteConfirmTarget(null);
    triggerToast('Notification record deleted.');
  };

  // Clear all notifications
  const handleClearAllNotifications = () => {
    onUpdateNotifications([]);
    setDeleteConfirmTarget(null);
    triggerToast('All notifications purged from database.');
  };

  // Save edited user
  const handleSaveUser = (updated: UserAccount) => {
    onUpdateUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
    triggerToast(`User ${updated.name} updated successfully.`);
  };

  // Add new user
  const handleCreateUser = (newUser: UserAccount) => {
    onUpdateUsers([newUser, ...users]);
    setIsNewUserModalOpen(false);
    triggerToast(`User ${newUser.name} created successfully.`);
  };

  // Save edited listing
  const handleSaveListing = (updated: Listing) => {
    onUpdateListings(listings.map((l) => (l.id === updated.id ? updated : l)));
    setEditingListing(null);
    triggerToast(`Listing "${updated.title}" updated.`);
  };

  // Add new listing via admin
  const handleCreateListing = (newListing: Listing) => {
    onUpdateListings([newListing, ...listings]);
    setIsNewListingModalOpen(false);
    triggerToast(`Listing "${newListing.title}" created.`);
  };

  // Dispatch Broadcast Notification
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setBroadcastFeedback('Please enter both title and message.');
      return;
    }

    const newNotifications: UserNotification[] = [];
    const timestamp = 'Just now';

    if (broadcastTarget === 'all') {
      // Send to all registered students
      users.forEach((u) => {
        newNotifications.push({
          id: `broadcast-${Date.now()}-${u.id}`,
          recipientUserId: u.id,
          recipientCampusId: u.campusId,
          requestId: 'admin-broadcast',
          listingId: 'system-announcement',
          listingTitle: 'System Announcement',
          listingCategory: 'resources',
          type: 'new_request_received',
          title: `Campus Announcement: ${broadcastTitle}`,
          message: broadcastMessage,
          ownerName: 'Campus Administrator',
          read: false,
          createdAt: timestamp,
        });
      });
    } else {
      // Send to specific user
      const targetUser = users.find((u) => u.id === broadcastTarget);
      if (targetUser) {
        newNotifications.push({
          id: `broadcast-${Date.now()}-${targetUser.id}`,
          recipientUserId: targetUser.id,
          recipientCampusId: targetUser.campusId,
          requestId: 'admin-notice',
          listingId: 'system-announcement',
          listingTitle: 'Admin Direct Notice',
          listingCategory: 'resources',
          type: 'new_request_received',
          title: broadcastTitle,
          message: broadcastMessage,
          ownerName: 'Campus Administrator',
          read: false,
          createdAt: timestamp,
        });
      }
    }

    onUpdateNotifications([...newNotifications, ...notifications]);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastFeedback(null);
    triggerToast(
      `Broadcast sent successfully to ${
        broadcastTarget === 'all' ? `all ${users.length} users` : 'selected student'
      }!`
    );
  };

  // Export full DB as JSON
  const handleExportDatabase = () => {
    const fullDatabase = {
      exportedAt: new Date().toISOString(),
      system: 'CampusShare Master Database',
      version: '4.0.0',
      telemetry: stats,
      databases: {
        users,
        listings,
        connectionRequests,
        notifications,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDatabase, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `campusshare_master_db_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerToast('Master database JSON backup exported successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Admin Master Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center font-black shadow-lg shadow-rose-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  CampusShare <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">Master Database Console</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">
                Full Database Authority &amp; System Control Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Switch to student marketplace */}
            <button
              id="admin-switch-to-marketplace-btn"
              onClick={onSwitchToStudentView}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Preview marketplace interface as student"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Preview Marketplace</span>
            </button>

            {/* Export JSON */}
            <button
              id="admin-export-db-btn"
              onClick={handleExportDatabase}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Export complete database JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export DB</span>
            </button>

            {/* Log out */}
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 hover:text-rose-100 rounded-lg text-xs font-bold border border-rose-500/40 transition-colors cursor-pointer"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-800/80 py-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Telemetry &amp; Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users Database ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'listings'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Listings Database ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'requests'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Requests Database ({connectionRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Broadcasts &amp; Alerts ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'maintenance'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>DB Maintenance &amp; Reset</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-3">
                  <ShieldAlert className="w-3.5 h-3.5" /> Master Administrator Privilege Active
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Welcome to CampusShare Master Database Hub
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  You have full read, write, modification, and permanent purge access across all student records, marketplace listings, communication requests, and system broadcasts.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" /> Manage Users ({stats.totalUsers})
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" /> Review Listings ({stats.totalListings})
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Campus Broadcast
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Users Metric */}
              <div
                onClick={() => setActiveTab('users')}
                className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-900 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{stats.totalUsers}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                  <span className="text-blue-400 font-semibold">{stats.studentCount} Students</span>
                  <span>•</span>
                  <span className="text-rose-400 font-semibold">{stats.adminCount} Admins</span>
                </div>
              </div>

              {/* Listings Metric */}
              <div
                onClick={() => setActiveTab('listings')}
                className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-900 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Listings</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{stats.totalListings}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-blue-400">{stats.resourceCount} Res</span>
                  <span>•</span>
                  <span className="text-emerald-400">{stats.serviceCount} Serv</span>
                  <span>•</span>
                  <span className="text-purple-400">{stats.oppCount} Opp</span>
                </div>
              </div>

              {/* Requests Metric */}
              <div
                onClick={() => setActiveTab('requests')}
                className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-900 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connection Inquiries</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{stats.totalRequests}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-400 font-semibold">{stats.pendingReqs} Pending</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{stats.acceptedReqs} Accepted</span>
                </div>
              </div>

              {/* Notifications Metric */}
              <div
                onClick={() => setActiveTab('notifications')}
                className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-900 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Dispatches</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{stats.totalNotifications}</div>
                <div className="text-xs text-slate-400 mt-2">
                  <span>Dispatched Notifications</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Listings Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-400" />
                    <span>Registered Student Directory</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {users.slice(0, 4).map((u) => (
                    <div
                      key={u.id}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {u.name}
                            <span className="text-[10px] text-slate-400 font-mono">({u.campusId})</span>
                            {u.role === 'admin' && (
                              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded text-[9px] font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email} • {u.department}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs cursor-pointer"
                        title="Edit User"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Marketplace Posts */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span>Recent Marketplace Posts</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {listings.slice(0, 4).map((l) => (
                    <div
                      key={l.id}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {l.imageUrl ? (
                          <img
                            src={l.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{l.title}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-indigo-400 font-semibold">{l.price}</span>
                            <span>•</span>
                            <span>{l.contactName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingListing(l)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs cursor-pointer"
                          title="Edit Listing"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmTarget({
                              type: 'listing',
                              id: l.id,
                              name: l.title,
                            })
                          }
                          className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg text-xs cursor-pointer"
                          title="Permanently Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS DATABASE */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-400" />
                  <span>Users Database ({filteredUsers.length} total)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Full control over student &amp; admin accounts, department assignments, and security roles.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="admin-add-user-btn"
                  onClick={() => setIsNewUserModalOpen(true)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add User / Admin
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name, campus ID, email, department or phone..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Campus ID</th>
                      <th className="py-3 px-4">Department &amp; Location</th>
                      <th className="py-3 px-4">Email &amp; Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Password</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => {
                      const userPostsCount = listings.filter(
                        (l) => l.userId === u.id || l.ownerCampusId === u.campusId
                      ).length;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {userPostsCount} listings posted
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-indigo-300">
                            {u.campusId}
                          </td>
                          <td className="py-3 px-4">
                            <div>{u.department}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" /> {u.campusLocation}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-200">{u.email}</div>
                            {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                          </td>
                          <td className="py-3 px-4">
                            {u.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                <Shield className="w-3 h-3" /> ADMIN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                STUDENT
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {u.password || '••••••••'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                                title="Edit User"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmTarget({
                                    type: 'user',
                                    id: u.id,
                                    name: `${u.name} (${u.campusId})`,
                                  })
                                }
                                disabled={u.id === currentUser.id}
                                className={`p-1.5 rounded-lg text-xs transition-colors ${
                                  u.id === currentUser.id
                                    ? 'text-slate-600 bg-slate-800/40 cursor-not-allowed'
                                    : 'text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 cursor-pointer'
                                }`}
                                title={
                                  u.id === currentUser.id
                                    ? 'Cannot delete your own active admin session'
                                    : 'Permanently Purge User & Records'
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LISTINGS DATABASE */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  <span>Marketplace Listings Database ({filteredListings.length} total)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Full control over textbook resources, student services, and partner opportunities.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="admin-add-listing-btn"
                  onClick={() => setIsNewListingModalOpen(true)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Listing as Admin
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="Search listings by title, tags, description, owner..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setListingCategoryFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    listingCategoryFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({listings.length})
                </button>
                <button
                  onClick={() => setListingCategoryFilter('resources')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    listingCategoryFilter === 'resources'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Resources
                </button>
                <button
                  onClick={() => setListingCategoryFilter('services')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    listingCategoryFilter === 'services'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => setListingCategoryFilter('opportunities')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    listingCategoryFilter === 'opportunities'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Opportunities
                </button>
              </div>
            </div>

            {/* Listings Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Item &amp; Category</th>
                      <th className="py-3 px-4">Pricing</th>
                      <th className="py-3 px-4">Owner &amp; Campus ID</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Posted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredListings.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {l.imageUrl ? (
                              <img
                                src={l.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-xs">
                              <div className="font-bold text-white truncate">{l.title}</div>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                  {l.category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400">
                                  {l.type === 'offering' ? 'Offering' : 'Looking For'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-400">{l.price}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{l.contactName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {l.ownerCampusId || l.userId || 'Direct Contact'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {l.contactVisibility === 'public' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              Public
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                              Approval Req
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{l.campusLocation}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">{l.createdAt}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingListing(l)}
                              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                              title="Edit Listing Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmTarget({
                                  type: 'listing',
                                  id: l.id,
                                  name: l.title,
                                })
                              }
                              className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg text-xs transition-colors cursor-pointer"
                              title="Permanently Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REQUESTS DATABASE */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-amber-400" />
                  <span>Connection Inquiries &amp; Requests ({filteredRequests.length} total)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Track, moderate, or manually override student match requests and contact sharing.
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  placeholder="Search requests by sender, owner, listing title, or message..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setRequestStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    requestStatusFilter === 'all'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({connectionRequests.length})
                </button>
                <button
                  onClick={() => setRequestStatusFilter('pending')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    requestStatusFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setRequestStatusFilter('accepted')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    requestStatusFilter === 'accepted'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setRequestStatusFilter('declined')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    requestStatusFilter === 'declined'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Declined
                </button>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Listing Target</th>
                      <th className="py-3 px-4">Sender Student</th>
                      <th className="py-3 px-4">Post Owner</th>
                      <th className="py-3 px-4">Inquiry Note</th>
                      <th className="py-3 px-4">Status &amp; Override</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{r.listingTitle}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {r.listingId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{r.senderName}</div>
                          <div className="text-[10px] text-slate-400">{r.senderEmail}</div>
                          {r.senderCampusId && (
                            <div className="text-[10px] text-indigo-300 font-mono">[{r.senderCampusId}]</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{r.ownerName}</div>
                          <div className="text-[10px] text-slate-400">{r.ownerEmail}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-slate-300 line-clamp-2 italic">"{r.note}"</div>
                          {r.attachmentImage && (
                            <span className="text-[10px] text-indigo-400 font-semibold mt-1 inline-flex items-center gap-1">
                              📷 Includes Attachment
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={r.status}
                              onChange={(e) =>
                                handleOverrideRequestStatus(
                                  r.id,
                                  e.target.value as 'pending' | 'accepted' | 'declined'
                                )
                              }
                              className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none ${
                                r.status === 'accepted'
                                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                                  : r.status === 'declined'
                                  ? 'bg-red-950/60 border-red-700 text-red-300'
                                  : 'bg-amber-950/60 border-amber-700 text-amber-300'
                              }`}
                            >
                              <option value="pending" className="bg-slate-900 text-white">Pending</option>
                              <option value="accepted" className="bg-slate-900 text-white">Accepted</option>
                              <option value="declined" className="bg-slate-900 text-white">Declined</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">{r.createdAt}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: 'request',
                                id: r.id,
                                name: `Inquiry from ${r.senderName} for "${r.listingTitle}"`,
                              })
                            }
                            className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Permanently Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS & BROADCASTS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Broadcast Composer */}
              <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Send className="w-4 h-4 text-indigo-400" />
                  <span>Dispatch System Broadcast</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Send high-priority alerts directly to student notification inboxes.
                </p>

                <form onSubmit={handleSendBroadcast} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Recipient Target
                    </label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">📢 All Registered Students ({users.length})</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          👤 {u.name} ({u.campusId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Broadcast Title *
                    </label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Finals Week Book Swap Alert"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Message Content *
                    </label>
                    <textarea
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Enter announcement details, instructions or campus guidelines..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {broadcastFeedback && (
                    <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
                      {broadcastFeedback}
                    </div>
                  )}

                  <button
                    type="submit"
                    id="admin-send-broadcast-btn"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Alert Now
                  </button>
                </form>
              </div>

              {/* Notification Logs */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-400" />
                      <span>Dispatched Notifications Log ({notifications.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live audit of all acceptance, decline, and system notices.
                    </p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() =>
                        setDeleteConfirmTarget({
                          type: 'all_notifications',
                          id: 'all',
                          name: 'all notifications',
                        })
                      }
                      className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Purge All
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                      No notification records found in database.
                    </div>
                  ) : (
                    filteredNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs">{n.title}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                n.type === 'request_approved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : n.type === 'request_declined'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {n.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              To: {n.recipientCampusId || n.recipientUserId || 'Public'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{n.message}</p>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>Time: {n.createdAt}</span>
                            <span>•</span>
                            <span>Status: {n.read ? 'Read' : 'Unread'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            setDeleteConfirmTarget({
                              type: 'notification',
                              id: n.id,
                              name: `Notification "${n.title}"`,
                            })
                          }
                          className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer shrink-0"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MAINTENANCE & DATA WIPE */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-rose-400" />
                <span>Database Backup, Seeding &amp; Factory Reset</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Perform full system backups, restore mock data fixtures, or wipe collections safely.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Full JSON Database Export</h3>
                  <p className="text-xs text-slate-400">
                    Download an offline JSON payload containing all users, listings, inquiries, and audit logs.
                  </p>
                  <button
                    onClick={handleExportDatabase}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                  >
                    <Download className="w-3.5 h-3.5" /> Export DB Backup
                  </button>
                </div>

                {/* Reset to Factory Defaults Card */}
                <div className="p-5 bg-slate-950 border border-rose-900/40 rounded-xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-rose-300">Reset to Factory Demo Seeds</h3>
                  <p className="text-xs text-slate-400">
                    Re-seeds default student profiles, initial campus listings, and resets local storage states.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset database to default seed state? This will clear all newly added user listings.')) {
                        onResetToDefaults();
                        triggerToast('Database reset to factory demo state successfully.');
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Database Seeds
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-400" />
                <span>Edit User Account</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveUser(editingUser);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Campus ID
                  </label>
                  <input
                    type="text"
                    value={editingUser.campusId}
                    onChange={(e) => setEditingUser({ ...editingUser, campusId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role || 'student'}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as 'student' | 'admin',
                        isAdmin: e.target.value === 'admin',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Location / Dorm
                  </label>
                  <input
                    type="text"
                    value={editingUser.campusLocation}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, campusLocation: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                <span>Create New User or Admin</span>
              </h3>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const campusId = (form.elements.namedItem('campusId') as HTMLInputElement).value;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                const role = (form.elements.namedItem('role') as HTMLSelectElement).value as 'student' | 'admin';
                const department = (form.elements.namedItem('department') as HTMLInputElement).value;
                const campusLocation = (form.elements.namedItem('campusLocation') as HTMLInputElement).value;
                const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;

                handleCreateUser({
                  id: `usr-${Date.now()}`,
                  name,
                  campusId,
                  email,
                  role,
                  isAdmin: role === 'admin',
                  department: department || 'General Studies',
                  campusLocation: campusLocation || 'Main Campus',
                  password: password || 'password123',
                  phone,
                  avatarBg: role === 'admin' ? 'bg-rose-600' : 'bg-indigo-600',
                  createdAt: 'Admin provisioned',
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Campus ID *
                  </label>
                  <input
                    name="campusId"
                    type="text"
                    required
                    placeholder="e.g. STU-2026-7890"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. jordan@campus.edu"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Department
                  </label>
                  <input
                    name="department"
                    type="text"
                    placeholder="e.g. Bioengineering"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Campus Location
                  </label>
                  <input
                    name="campusLocation"
                    type="text"
                    placeholder="e.g. South Tower Dorm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Password *
                  </label>
                  <input
                    name="password"
                    type="text"
                    defaultValue="password123"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT LISTING */}
      {editingListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Edit Marketplace Listing</span>
              </h3>
              <button
                onClick={() => setEditingListing(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveListing(editingListing);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingListing.title}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={editingListing.category}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
                        category: e.target.value as PillarCategory,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="resources">Resources (Textbooks/Hardware)</option>
                    <option value="services">Services (Tutoring/Design)</option>
                    <option value="opportunities">Opportunities (Projects/Teams)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={editingListing.type}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
                        type: e.target.value as ListingType,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="offering">Offering</option>
                    <option value="looking_for">Looking For</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingListing.description}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Price / Terms
                  </label>
                  <input
                    type="text"
                    value={editingListing.price}
                    onChange={(e) =>
                      setEditingListing({ ...editingListing, price: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Contact Visibility
                  </label>
                  <select
                    value={editingListing.contactVisibility || 'approval_required'}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
                        contactVisibility: e.target.value as ContactVisibility,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="approval_required">Approval Required (Protected)</option>
                    <option value="public">Public (Instant Unlocked)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={editingListing.contactName}
                    onChange={(e) =>
                      setEditingListing({ ...editingListing, contactName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    value={editingListing.campusLocation}
                    onChange={(e) =>
                      setEditingListing({ ...editingListing, campusLocation: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editingListing.imageUrl || ''}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" /> Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION PURGE DIALOG */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Permanent Database Deletion
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-rose-300">"{deleteConfirmTarget.name}"</span>?
                {deleteConfirmTarget.type === 'user' && (
                  <span className="block mt-2 text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/50">
                    ⚠️ Deleting this user will also purge all their posted marketplace listings and connection request history.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="admin-confirm-delete-btn"
                onClick={() => {
                  if (deleteConfirmTarget.type === 'user') {
                    handleExecuteDeleteUser(deleteConfirmTarget.id);
                  } else if (deleteConfirmTarget.type === 'listing') {
                    handleExecuteDeleteListing(deleteConfirmTarget.id);
                  } else if (deleteConfirmTarget.type === 'request') {
                    handleExecuteDeleteRequest(deleteConfirmTarget.id);
                  } else if (deleteConfirmTarget.type === 'notification') {
                    handleExecuteDeleteNotification(deleteConfirmTarget.id);
                  } else if (deleteConfirmTarget.type === 'all_notifications') {
                    handleClearAllNotifications();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/40"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Toast Alert */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl border border-rose-500/50 shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-rose-400" />
          <span>{adminToast}</span>
        </div>
      )}
    </div>
  );
}
