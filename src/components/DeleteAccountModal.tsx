import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Trash2, 
  UserX, 
  ShieldAlert,
  PackageCheck,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';

interface DeleteAccountModalProps {
  isOpen: boolean;
  currentUser: UserAccount | null;
  userPostCount: number;
  onClose: () => void;
  onConfirmDelete: (userId: string) => void;
}

export function DeleteAccountModal({
  isOpen,
  currentUser,
  userPostCount,
  onClose,
  onConfirmDelete,
}: DeleteAccountModalProps) {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const expectedConfirmText = 'DELETE';
  const isMatch = confirmInput.trim().toUpperCase() === expectedConfirmText;

  const handleDelete = () => {
    if (!isMatch) return;
    setIsDeleting(true);
    setTimeout(() => {
      onConfirmDelete(currentUser.id);
      setIsDeleting(false);
      setConfirmInput('');
      onClose();
    }, 400);
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-red-600 p-5 text-white flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 border border-white/30">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight">Delete Account Permanently</h3>
                <p className="text-xs text-red-100 mt-0.5">
                  Permanent data erasure &amp; campus credential removal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-delete-modal-btn"
              className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Account Summary Card */}
            <div className="bg-red-50/60 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-slate-500 font-mono text-[11px]">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-red-800 bg-red-100/80 px-1.5 py-0.5 rounded text-[10px]">
                    Campus ID: {currentUser.campusId}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {currentUser.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-red-700">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                This action is irreversible and cannot be undone:
              </p>
              <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-slate-600">
                <li>
                  Your profile credentials and campus authentication record will be erased.
                </li>
                <li>
                  <strong className="text-slate-800">
                    {userPostCount} uploaded marketplace {userPostCount === 1 ? 'post' : 'posts'}
                  </strong>{' '}
                  will be removed from CampusShare immediately.
                </li>
                <li>
                  All connection requests, notes, and inquiries tied to your account will be deleted.
                </li>
                <li>
                  You will be logged out and returned to the CampusShare sign-in screen.
                </li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Type <span className="font-mono font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-200">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                id="delete-account-confirm-input"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                autoComplete="off"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                id="cancel-delete-account-btn"
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-account-btn"
                disabled={!isMatch || isDeleting}
                onClick={handleDelete}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isMatch && !isDeleting
                    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
