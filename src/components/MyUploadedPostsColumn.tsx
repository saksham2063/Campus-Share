import React from 'react';
import { 
  Package, 
  Wrench, 
  Target, 
  Plus, 
  Trash2, 
  Inbox, 
  Clock, 
  MapPin, 
  Tag, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lock,
  Globe,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing, UserAccount, ConnectionRequest } from '../types';

interface MyUploadedPostsColumnProps {
  currentUser: UserAccount;
  myListings: Listing[];
  connectionRequests: ConnectionRequest[];
  onOpenPostModal: () => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (listingId: string) => void;
  onOpenRequestsForListing: (listingId: string) => void;
  onViewListingDetails: (listing: Listing) => void;
}

export function MyUploadedPostsColumn({
  currentUser,
  myListings,
  connectionRequests,
  onOpenPostModal,
  onEditListing,
  onDeleteListing,
  onOpenRequestsForListing,
  onViewListingDetails,
}: MyUploadedPostsColumnProps) {
  // Compute how many requests each listing has received (only for owner)
  const getRequestsForListing = (listingId: string) => {
    return connectionRequests.filter(
      (r) => r.listingId === listingId && (r.ownerUserId === currentUser.id || r.isIncoming)
    );
  };

  const totalInquiriesReceived = connectionRequests.filter(
    (r) =>
      (r.ownerUserId === currentUser.id || r.isIncoming) &&
      myListings.some((l) => l.id === r.listingId)
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Banner / User Stats Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{currentUser.name}&apos;s Uploaded Posts</h2>
                <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  ID: {currentUser.campusId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.department} • {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="my-posts-add-new-btn"
              onClick={onOpenPostModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Post</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="text-lg sm:text-xl font-extrabold text-slate-800">{myListings.length}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Uploads
            </div>
          </div>
          <div className="bg-indigo-50/60 rounded-xl p-2.5 border border-indigo-100">
            <div className="text-lg sm:text-xl font-extrabold text-indigo-700">
              {myListings.filter((l) => l.type === 'offering').length}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Offerings
            </div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100">
            <div className="text-lg sm:text-xl font-extrabold text-emerald-700">{totalInquiriesReceived}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Inquiries Received
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Posts List */}
      {myListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {myListings.map((listing) => {
              const inquiries = getRequestsForListing(listing.id);
              const pendingInquiries = inquiries.filter((i) => i.status === 'pending');
              const isPublic = listing.contactVisibility === 'public';

              return (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Bar with Category & Status */}
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          listing.category === 'resources'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : listing.category === 'services'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {listing.category === 'resources' && <Package className="w-3 h-3" />}
                        {listing.category === 'services' && <Wrench className="w-3 h-3" />}
                        {listing.category === 'opportunities' && <Target className="w-3 h-3" />}
                        {listing.category.toUpperCase()}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          listing.type === 'offering'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {listing.type === 'offering' ? 'Offering' : 'Looking For'}
                      </span>
                    </div>

                    {/* Image preview if present */}
                    {listing.imageUrl && (
                      <div className="mb-3 rounded-xl overflow-hidden h-36 bg-slate-100 relative">
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Photo Attached
                        </div>
                      </div>
                    )}

                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
                      {listing.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {listing.description}
                    </p>

                    {/* Privacy setting badge */}
                    <div className="mb-2">
                      {isPublic ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                          <Globe className="w-3 h-3" />
                          Public Display: {listing.publicContactDisplay === 'email_only' ? 'Email Only' : listing.publicContactDisplay === 'phone_only' ? 'Phone Only' : 'Both Phone & Email'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          Protected (Requires your approval)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-900">{listing.price}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[120px]">{listing.campusLocation}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Activity & Management Strip */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Inquiry status pill */}
                    <button
                      onClick={() => onOpenRequestsForListing(listing.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        pendingInquiries.length > 0
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 animate-pulse'
                          : inquiries.length > 0
                          ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title="View student inquiries on this post"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>
                        {inquiries.length === 0
                          ? 'No requests yet'
                          : `${inquiries.length} ${inquiries.length === 1 ? 'Request' : 'Requests'}`}
                      </span>
                    </button>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        id={`edit-my-post-${listing.id}`}
                        onClick={() => onEditListing(listing)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Edit listing details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        id={`delete-my-post-${listing.id}`}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove "${listing.title}"?`)) {
                            onDeleteListing(listing.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete this uploaded listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">You haven&apos;t uploaded any posts yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Share textbooks you no longer need, offer tutoring or shifting help, or post a study group/hackathon partner request with your campus peers!
          </p>
          <button
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Post</span>
          </button>
        </div>
      )}
    </div>
  );
}
