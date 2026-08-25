import { 
  MapPin, 
  Bookmark, 
  Send,
  CheckCircle,
  Clock,
  Lock,
  Globe,
  Mail,
  Phone,
  Edit3
} from 'lucide-react';
import { Listing, PillarCategory, ConnectionStatus } from '../types';

interface ListingCardProps {
  listing: Listing;
  isOwner?: boolean;
  connectionStatus?: ConnectionStatus;
  onConnect: (listing: Listing) => void;
  onEdit?: (listing: Listing) => void;
  onToggleSave: (id: string) => void;
}

export function ListingCard({
  listing,
  isOwner,
  connectionStatus,
  onConnect,
  onEdit,
  onToggleSave,
}: ListingCardProps) {
  // High Density category styling helper
  const getCategoryBadge = (category: PillarCategory) => {
    switch (category) {
      case 'resources':
        return (
          <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
            Resource
          </span>
        );
      case 'services':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
            Service
          </span>
        );
      case 'opportunities':
        return (
          <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
            Opportunity
          </span>
        );
    }
  };

  const isOffering = listing.type === 'offering';
  const isPublicContact = listing.contactVisibility === 'public';

  const getPublicBadgeLabel = () => {
    if (listing.publicContactDisplay === 'email_only') return 'Public Email';
    if (listing.publicContactDisplay === 'phone_only') return 'Public Phone';
    return 'Direct Contact';
  };

  return (
    <article
      id={`listing-card-${listing.id}`}
      className="listing-card group bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md flex flex-col justify-between transition-all duration-150 hover:border-slate-300 overflow-hidden"
    >
      {/* Optional Photo Thumbnail if uploaded by Owner */}
      {listing.imageUrl && (
        <div 
          onClick={() => onConnect(listing)}
          className="relative w-full h-36 bg-slate-100 overflow-hidden cursor-pointer group/img"
        >
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
          {listing.conditionOrUrgency && (
            <span className="absolute bottom-2 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              {listing.conditionOrUrgency}
            </span>
          )}
        </div>
      )}

      <div className="p-4 pb-0">
        {/* Top Header Row with Pillar Badge, Type, and Save Bookmark */}
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getCategoryBadge(listing.category)}
            <span className="text-slate-400 text-xs font-medium">
              {isOffering ? 'Offering' : 'Looking For'}
            </span>
            {isPublicContact ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200">
                <Globe className="w-2.5 h-2.5" />
                {getPublicBadgeLabel()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                Protected
              </span>
            )}
          </div>

          <button
            id={`listing-save-btn-${listing.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(listing.id);
            }}
            className="text-slate-300 hover:text-indigo-600 transition-colors p-0.5 rounded cursor-pointer"
            title={listing.saved ? 'Remove from saved' : 'Save listing'}
          >
            <Bookmark
              className={`w-4 h-4 ${
                listing.saved ? 'fill-indigo-600 text-indigo-600' : ''
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <h3
          id={`listing-title-${listing.id}`}
          className="text-slate-900 font-bold text-sm mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors cursor-pointer"
          onClick={() => onConnect(listing)}
        >
          {listing.title}
        </h3>

        {/* Description */}
        <p
          id={`listing-desc-${listing.id}`}
          className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-2.5"
        >
          {listing.description}
        </p>

        {/* Location & Tags row */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2 mb-1">
          <div className="flex items-center gap-1 truncate text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{listing.campusLocation}</span>
          </div>
          {listing.tags && listing.tags.length > 0 && (
            <span className="shrink-0 text-slate-400 font-medium">
              #{listing.tags[0]}
            </span>
          )}
        </div>
      </div>

      {/* High Density Footer: Price, Privacy Indicator & Connect CTA */}
      <div className="p-4 pt-3 mt-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-col">
          <span className="text-indigo-600 font-bold text-sm leading-tight">
            {listing.price}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            by {listing.contactName}
            {isPublicContact ? (
              <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                • 🌐 Direct
              </span>
            ) : connectionStatus === 'accepted' ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> Connected
              </span>
            ) : (
              <span className="text-slate-400" title="Contact details protected until accepted">
                <Lock className="w-2.5 h-2.5 inline text-slate-400" />
              </span>
            )}
          </span>
        </div>

        {isOwner ? (
          <div className="flex items-center gap-1.5">
            <button
              id={`listing-edit-btn-${listing.id}`}
              onClick={() => onEdit ? onEdit(listing) : onConnect(listing)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-md text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3 text-indigo-600" />
              <span>Edit Post</span>
            </button>
          </div>
        ) : isPublicContact ? (
          <button
            id={`listing-connect-btn-${listing.id}`}
            onClick={() => onConnect(listing)}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Globe className="w-3 h-3" />
            <span>Contact Info</span>
          </button>
        ) : connectionStatus === 'accepted' ? (
          <button
            id={`listing-connect-btn-${listing.id}`}
            onClick={() => onConnect(listing)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            <span>View Contact</span>
          </button>
        ) : connectionStatus === 'pending' ? (
          <button
            id={`listing-connect-btn-${listing.id}`}
            onClick={() => onConnect(listing)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-md text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </button>
        ) : (
          <button
            id={`listing-connect-btn-${listing.id}`}
            onClick={() => onConnect(listing)}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Connect</span>
          </button>
        )}
      </div>
    </article>
  );
}

