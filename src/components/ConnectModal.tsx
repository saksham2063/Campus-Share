import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  GraduationCap, 
  ShieldCheck,
  Lock,
  Globe,
  CheckCircle2,
  Clock,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  MessageSquarePlus,
  Edit3,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing, ConnectionRequest, UserAccount } from '../types';

interface ConnectModalProps {
  listing: Listing | null;
  currentUser?: UserAccount | null;
  existingRequest?: ConnectionRequest;
  onClose: () => void;
  onEdit?: (listing: Listing) => void;
  onSendRequest: (requestData: {
    listing: Listing;
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    note: string;
    attachmentImage?: string;
  }) => void;
}

export function ConnectModal({
  listing,
  currentUser,
  existingRequest,
  onClose,
  onEdit,
  onSendRequest,
}: ConnectModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form states for sending a request
  const [senderName, setSenderName] = useState(currentUser?.name || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [note, setNote] = useState('');
  const [attachmentImage, setAttachmentImage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showDirectNoteForm, setShowDirectNoteForm] = useState(false);

  // Synchronize when listing or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSenderName(currentUser.name);
      setSenderEmail(currentUser.email);
      setSenderPhone(currentUser.phone || '');
    }
    setNote('');
    setAttachmentImage('');
    setError(null);
    setShowDirectNoteForm(false);
  }, [listing, currentUser]);

  if (!listing) return null;

  const isOwner = Boolean(
    currentUser && (
      listing.userId === currentUser.id ||
      listing.ownerCampusId === currentUser.campusId ||
      listing.contactEmail.toLowerCase() === currentUser.email.toLowerCase()
    )
  );
  const isPublic = listing.contactVisibility === 'public';
  const isAccepted = existingRequest?.status === 'accepted';
  const isPending = existingRequest?.status === 'pending';

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please attach an image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Attached image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachmentImage(event.target?.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please add a brief note to introduce your request');
      return;
    }
    if (!senderName.trim() || !senderEmail.trim()) {
      setError('Please fill in your name and campus email');
      return;
    }

    onSendRequest({
      listing,
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      senderPhone: senderPhone.trim(),
      note: note.trim(),
      attachmentImage: attachmentImage || undefined,
    });
    onClose();
  };

  // Visibility flags for public contact channels
  const showPublicEmail = isPublic && (listing.publicContactDisplay === 'both' || listing.publicContactDisplay === 'email_only' || !listing.publicContactDisplay);
  const showPublicPhone = isPublic && (listing.publicContactDisplay === 'both' || listing.publicContactDisplay === 'phone_only');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-6"
        >
          {/* Header */}
          <div className={`p-5 text-white flex items-start justify-between ${
            isPublic ? 'bg-indigo-900' : isAccepted ? 'bg-emerald-700' : isPending ? 'bg-amber-700' : 'bg-indigo-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 text-white font-bold text-base flex items-center justify-center border border-white/30 shrink-0">
                {listing.contactName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white">{listing.contactName}</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" title="Verified Campus Student" />
                </div>
                <p className="text-xs text-indigo-100 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Post Owner • {listing.campusLocation}
                </p>
              </div>
            </div>
            <button
              id="connect-modal-close-btn"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Listing Summary Snippet */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              {listing.imageUrl && (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  Regarding Listing
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{listing.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700">{listing.price}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {listing.campusLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner banner if current user is the owner */}
            {isOwner && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    You are the owner of this post
                  </span>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    You can update details, change pricing or adjust contact visibility anytime.
                  </p>
                </div>
                {onEdit && (
                  <button
                    type="button"
                    id="connect-modal-edit-btn"
                    onClick={() => {
                      onClose();
                      onEdit(listing);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Post</span>
                  </button>
                )}
              </div>
            )}

            {/* SCENARIO 1: Listing Has Public Contact Visibility -> Instant Display of Chosen Channels */}
            {isPublic ? (
              <div className="space-y-4">
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Globe className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-indigo-950">Public Contact Channels</h5>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      {listing.contactName} made their contact info public on this post. You can reach out directly using the unlocked channels below:
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Public Campus Email */}
                  {showPublicEmail && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Campus Email (Public)</span>
                          <span className="text-xs font-semibold text-slate-800">{listing.contactEmail}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(listing.contactEmail, 'public_email')}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Copy email"
                        >
                          {copiedType === 'public_email' ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`mailto:${listing.contactEmail}?subject=CampusShare: ${encodeURIComponent(listing.title)}`}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Send Mail
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Public Phone / WhatsApp */}
                  {showPublicPhone && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">WhatsApp / Mobile (Public)</span>
                          <span className="text-xs font-semibold text-slate-800">{listing.contactPhone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(listing.contactPhone, 'public_phone')}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Copy phone"
                        >
                          {copiedType === 'public_phone' ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Clarification if owner chose single channel */}
                  {listing.publicContactDisplay === 'email_only' && (
                    <p className="text-[11px] text-slate-400 italic px-1">
                      🔒 Phone number is kept private by owner choice.
                    </p>
                  )}
                  {listing.publicContactDisplay === 'phone_only' && (
                    <p className="text-[11px] text-slate-400 italic px-1">
                      🔒 Direct email address is kept private by owner choice.
                    </p>
                  )}
                </div>

                {/* Optional Note Sending on Public Posts */}
                <div className="border-t border-slate-100 pt-3">
                  {!showDirectNoteForm ? (
                    <button
                      type="button"
                      onClick={() => setShowDirectNoteForm(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      <span>Also Send an In-App Note &amp; Image to Owner</span>
                    </button>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Send CampusShare In-App Note</span>
                        <button
                          type="button"
                          onClick={() => setShowDirectNoteForm(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Hide
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Leave a quick note for the owner in their CampusShare requests inbox..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                      />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send In-App Note</span>
                      </button>
                    </form>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : isAccepted ? (
              /* SCENARIO 2: Protected Listing -> Request Already Accepted -> Reveal Contact Details */
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-900">Connection Accepted by {listing.contactName}!</h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      The owner approved your request. Direct campus communication channels are now unlocked below.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Unlocked Contact Channels
                  </label>

                  {/* Campus Email */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Campus Email</span>
                        <span className="text-xs font-semibold text-slate-800">{listing.contactEmail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(listing.contactEmail, 'email')}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy email"
                      >
                        {copiedType === 'email' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`mailto:${listing.contactEmail}?subject=CampusShare: ${encodeURIComponent(listing.title)}`}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Email
                      </a>
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">WhatsApp / Mobile</span>
                        <span className="text-xs font-semibold text-slate-800">{listing.contactPhone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(listing.contactPhone, 'phone')}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy phone"
                      >
                        {copiedType === 'phone' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : isPending ? (
              /* SCENARIO 3: Request is Pending */
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">Request Sent &amp; Awaiting Owner Approval</h5>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Your note has been delivered to {listing.contactName}. Contact details will be displayed here as soon as they accept.
                    </p>
                  </div>
                </div>

                {/* Sent Note Preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase">Your Sent Note:</div>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    &quot;{existingRequest.note}&quot;
                  </p>
                  {existingRequest.attachmentImage && (
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">Attached Image:</span>
                      <img
                        src={existingRequest.attachmentImage}
                        alt="Attached by you"
                        className="w-24 h-24 object-cover rounded-lg border border-slate-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* SCENARIO 4: Protected Listing, New Request (Not Yet Sent) -> Contact Details Hidden + Send Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Privacy Safeguard Notice */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950 leading-relaxed">
                    <span className="font-bold">Contact Details Protected:</span> Phone number and direct email are kept private until <span className="font-semibold">{listing.contactName}</span> accepts your connection request.
                  </div>
                </div>

                {/* Note to Owner */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Send a Note to {listing.contactName} *
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setError(null);
                    }}
                    placeholder={`Hi ${listing.contactName}, I saw your listing on CampusShare and would like to connect/collaborate. Are you available this week?`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Image Uploadation by User */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Attach an Image (Optional)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />

                  {attachmentImage ? (
                    <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                      <img
                        src={attachmentImage}
                        alt="User attachment"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Image attached</p>
                        <p className="text-[10px] text-slate-500">Student ID, problem screenshot, or trade item</p>
                        <button
                          type="button"
                          onClick={() => setAttachmentImage('')}
                          className="mt-1 text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span><span className="font-semibold text-indigo-600">Upload screenshot/photo</span> (ID, problem or item)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sender Quick Info */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Your Campus Email
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                  </p>
                )}

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="send-connect-request-btn"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Note &amp; Request Connection</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    {listing.contactName} will receive your note and can approve to reveal contact info.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

