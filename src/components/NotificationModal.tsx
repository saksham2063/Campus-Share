import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  X, 
  Mail, 
  Phone, 
  ExternalLink, 
  Sparkles,
  Package,
  Wrench,
  Target,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserNotification, Listing } from '../types';

interface NotificationPopupProps {
  notification: UserNotification | null;
  onClose: () => void;
  onViewListing?: (listingId: string) => void;
}

export function NotificationPopup({ notification, onClose, onViewListing }: NotificationPopupProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!notification) return null;

  const isApproved = notification.type === 'request_approved';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-2xs pointer-events-auto"
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden z-10 my-8 pointer-events-auto"
        >
          {/* Header */}
          <div
            className={`p-5 text-white flex items-start justify-between ${
              isApproved
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                : 'bg-gradient-to-r from-slate-800 to-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner ${
                  isApproved ? 'bg-white/20 border border-white/30' : 'bg-red-500/20 border border-red-400/30'
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-300" />
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white inline-block mb-1">
                  {isApproved ? 'Connection Approved' : 'Request Update'}
                </span>
                <h3 className="text-base font-bold leading-snug">
                  {isApproved ? 'Connection Request Accepted!' : 'Request Not Approved'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              id="close-notif-popup-btn"
              className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Post Referenced
              </p>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {notification.listingTitle}
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {notification.message}
            </p>

            {/* If Approved: Display Unlocked Owner Contact Details */}
            {isApproved && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Unlocked Contact Channels
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    {notification.ownerName}
                  </span>
                </div>

                {notification.ownerEmail && (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800 truncate font-semibold">
                        {notification.ownerEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`mailto:${notification.ownerEmail}?subject=${encodeURIComponent(
                          `CampusShare: ${notification.listingTitle}`
                        )}`}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-semibold text-[11px] transition-colors"
                      >
                        Email
                      </a>
                      <button
                        onClick={() => copyToClipboard(notification.ownerEmail!, 'email')}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        title="Copy email address"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {notification.ownerPhone && (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800 font-semibold">
                        {notification.ownerPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://wa.me/${notification.ownerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-semibold text-[11px] transition-colors"
                      >
                        WhatsApp
                      </a>
                      <button
                        onClick={() => copyToClipboard(notification.ownerPhone!, 'phone')}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        title="Copy phone number"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                id="ack-notification-btn"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isApproved ? 'Great, Got It!' : 'Dismiss'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface NotificationMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
  notifications: UserNotification[];
  onSelectNotification: (notif: UserNotification) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export function NotificationDropdown({
  isOpen = true,
  onClose,
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
  onClearAll,
}: NotificationMenuProps) {
  if (isOpen === false) return null;

  return (
    <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={onMarkAllAsRead}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Mark read
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-red-600 font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center px-4">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You will receive popups and alerts when post owners approve or decline your requests.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isApproved = notif.type === 'request_approved';
            return (
              <div
                key={notif.id}
                onClick={() => onSelectNotification(notif)}
                className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                  !notif.read ? 'bg-indigo-50/40' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.createdAt}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded mt-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Contact info available
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
