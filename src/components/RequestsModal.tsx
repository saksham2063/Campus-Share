import React, { useState } from 'react';
import { 
  X, 
  Inbox, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  Lock, 
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectionRequest, UserAccount } from '../types';

interface RequestsModalProps {
  isOpen: boolean;
  currentUser?: UserAccount | null;
  onClose: () => void;
  requests: ConnectionRequest[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
}

export function RequestsModal({
  isOpen,
  currentUser,
  onClose,
  requests,
  onAcceptRequest,
  onDeclineRequest,
}: RequestsModalProps) {
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  // STRICT PRIVACY ISOLATION:
  // Incoming requests are EXCLUSIVELY for listings owned by the logged-in student (ownerUserId === currentUser.id)
  const incomingRequests = requests.filter((r) => {
    if (currentUser?.id) {
      return r.ownerUserId === currentUser.id;
    }
    return r.isIncoming;
  });

  // Sent requests are EXCLUSIVELY requests sent by the logged-in student (senderUserId === currentUser.id)
  const sentRequests = requests.filter((r) => {
    if (currentUser?.id) {
      return r.senderUserId === currentUser.id;
    }
    return !r.isIncoming;
  });

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

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
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-6 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-indigo-200 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connection Requests &amp; Inbox</h3>
                <p className="text-[11px] text-indigo-200">Manage incoming and outgoing student connection requests</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'incoming'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Incoming for Your Posts</span>
              {pendingIncomingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-bold">
                  {pendingIncomingCount} new
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'sent'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Sent Requests ({sentRequests.length})</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'incoming' ? (
              incomingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">No incoming requests yet</h4>
                  <p className="text-xs max-w-sm mx-auto">
                    When other students request to connect with your posted resources or services, their notes and images will appear here.
                  </p>
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{req.senderName}</span>
                          <span className="text-[10px] text-slate-400">• {req.createdAt}</span>
                          {req.status === 'accepted' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Accepted
                            </span>
                          )}
                          {req.status === 'declined' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                              Declined
                            </span>
                          )}
                          {req.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Pending Your Approval
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                          Regarding: {req.listingTitle}
                        </p>
                      </div>
                    </div>

                    {/* Sender's Note */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                        <MessageSquare className="w-3 h-3" /> Note from student
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        "{req.note}"
                      </p>
                    </div>

                    {/* Attached Image from Student */}
                    {req.attachmentImage && (
                      <div className="flex items-center gap-2">
                        <div 
                          onClick={() => setPreviewImage(req.attachmentImage || null)}
                          className="relative group/img cursor-pointer inline-block"
                        >
                          <img
                            src={req.attachmentImage}
                            alt="Student attached"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                            View Full
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          📷 Image attached (student ID, problem, or schedule)
                        </span>
                      </div>
                    )}

                    {/* Contact Info (if accepted) or Action Buttons */}
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Accepting reveals your contact details to {req.senderName}.
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDeclineRequest(req.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onAcceptRequest(req.id)}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept Request
                          </button>
                        </div>
                      </div>
                    ) : req.status === 'accepted' ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-800">
                        <span className="font-semibold">Student Contact: {req.senderEmail} {req.senderPhone && `• ${req.senderPhone}`}</span>
                        <a
                          href={`mailto:${req.senderEmail}?subject=CampusShare: ${encodeURIComponent(req.listingTitle)}`}
                          className="px-2 py-1 text-[11px] font-bold bg-white text-emerald-700 rounded border border-emerald-300 hover:bg-emerald-100"
                        >
                          Send Email
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))
              )
            ) : (
              sentRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Send className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">No sent requests</h4>
                  <p className="text-xs max-w-sm mx-auto">
                    When you connect with other student listings, you can track their approval status and unlock contact info here.
                  </p>
                </div>
              ) : (
                sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{req.listingTitle}</h4>
                          <span className="text-[10px] text-slate-400">• {req.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Owner: <span className="font-semibold text-slate-700">{req.ownerName}</span></p>
                      </div>

                      {req.status === 'accepted' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Accepted &amp; Unlocked
                        </span>
                      ) : req.status === 'declined' ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" /> Declined
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending Owner Review
                        </span>
                      )}
                    </div>

                    {/* Note sent */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Your Note:</span>
                      "{req.note}"
                      {req.attachmentImage && (
                        <div className="mt-2">
                          <img
                            src={req.attachmentImage}
                            alt="Sent attachment"
                            className="w-16 h-16 object-cover rounded-md border border-slate-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Contact Details (Unlocked or Locked) */}
                    {req.status === 'accepted' ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Unlocked Owner Contact Channels:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-200">
                            <div className="flex items-center gap-2 truncate">
                              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate text-slate-800 font-medium">{req.ownerEmail}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(req.ownerEmail, `email-${req.id}`)}
                              className="text-slate-400 hover:text-emerald-600 p-1"
                              title="Copy email"
                            >
                              {copiedType === `email-${req.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-200">
                            <div className="flex items-center gap-2 truncate">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate text-slate-800 font-medium">{req.ownerPhone}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(req.ownerPhone, `phone-${req.id}`)}
                              className="text-slate-400 hover:text-emerald-600 p-1"
                              title="Copy phone"
                            >
                              {copiedType === `phone-${req.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-slate-500">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Owner's phone and email remain private until <strong className="text-slate-700">{req.ownerName}</strong> accepts your request.</span>
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>

          {/* Lightbox for Image Preview */}
          {previewImage && (
            <div 
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
            >
              <div className="relative max-w-xl max-h-[85vh]">
                <img
                  src={previewImage}
                  alt="Full preview"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-3 -right-3 bg-white text-slate-900 rounded-full p-1.5 shadow-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close Inbox
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
