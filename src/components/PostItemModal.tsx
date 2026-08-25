import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Package, 
  Wrench, 
  Target, 
  Sparkles, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  Trash2,
  Lock,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  Save,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing, PillarCategory, ListingType, NewListingFormData, UserAccount, ContactVisibility, PublicContactDisplay } from '../types';

interface PostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: Listing, isEditing?: boolean) => void;
  currentUser: UserAccount | null;
  editingListing?: Listing | null;
}

export function PostItemModal({ isOpen, onClose, onSubmit, currentUser, editingListing }: PostItemModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isEditMode = Boolean(editingListing);

  const [formData, setFormData] = useState<NewListingFormData>({
    title: '',
    category: 'resources',
    type: 'offering',
    description: '',
    tags: '',
    price: '',
    contactName: currentUser?.name || '',
    contactEmail: currentUser?.email || '',
    contactPhone: currentUser?.phone || '',
    campusLocation: currentUser?.campusLocation || '',
    conditionOrUrgency: '',
    imageUrl: '',
    contactVisibility: 'approval_required',
    publicContactDisplay: 'both',
  });

  // Keep form data synchronized with editing listing or current user when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingListing) {
        setFormData({
          title: editingListing.title || '',
          category: editingListing.category || 'resources',
          type: editingListing.type || 'offering',
          description: editingListing.description || '',
          tags: Array.isArray(editingListing.tags) ? editingListing.tags.join(', ') : '',
          price: editingListing.price || '',
          contactName: editingListing.contactName || currentUser?.name || '',
          contactEmail: editingListing.contactEmail || currentUser?.email || '',
          contactPhone: editingListing.contactPhone || currentUser?.phone || '',
          campusLocation: editingListing.campusLocation || currentUser?.campusLocation || '',
          conditionOrUrgency: editingListing.conditionOrUrgency || '',
          imageUrl: editingListing.imageUrl || '',
          contactVisibility: editingListing.contactVisibility || 'approval_required',
          publicContactDisplay: editingListing.publicContactDisplay || 'both',
        });
      } else if (currentUser) {
        setFormData({
          title: '',
          category: 'resources',
          type: 'offering',
          description: '',
          tags: '',
          price: '',
          contactName: currentUser.name,
          contactEmail: currentUser.email,
          contactPhone: currentUser.phone || '',
          campusLocation: currentUser.campusLocation || '',
          conditionOrUrgency: '',
          imageUrl: '',
          contactVisibility: 'approval_required',
          publicContactDisplay: 'both',
        });
      }
      setErrors({});
    }
  }, [isOpen, editingListing, currentUser]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.contactName.trim()) errs.contactName = 'Your name is required';
    if (!formData.contactEmail.trim()) {
      errs.contactEmail = 'Campus email is required';
    } else if (!formData.contactEmail.includes('@')) {
      errs.contactEmail = 'Please enter a valid email address';
    }
    if (!formData.contactPhone.trim()) {
      errs.contactPhone = 'WhatsApp / Phone number is required';
    }
    if (!formData.campusLocation.trim()) {
      errs.campusLocation = 'Campus location or dorm is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image file (PNG, JPG, WebP)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size should be under 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, imageUrl: event.target?.result as string }));
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.image;
          return updated;
        });
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
    if (!validate()) return;

    const parsedTags = formData.tags
      ? formData.tags
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean)
      : [
          formData.category === 'resources'
            ? 'CampusGear'
            : formData.category === 'services'
            ? 'StudentService'
            : 'Opportunity',
        ];

    if (isEditMode && editingListing) {
      const updatedListing: Listing = {
        ...editingListing,
        title: formData.title.trim(),
        category: formData.category,
        type: formData.type,
        description: formData.description.trim(),
        tags: parsedTags,
        price: formData.price.trim() || (formData.type === 'offering' ? 'Free / Negotiable' : 'Seeking'),
        contactName: formData.contactName.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        campusLocation: formData.campusLocation.trim(),
        conditionOrUrgency: formData.conditionOrUrgency.trim() || undefined,
        imageUrl: formData.imageUrl || undefined,
        contactVisibility: formData.contactVisibility,
        publicContactDisplay: formData.contactVisibility === 'public' ? formData.publicContactDisplay : undefined,
      };

      onSubmit(updatedListing, true);
      onClose();
      return;
    }

    const newListing: Listing = {
      id: `custom-${Date.now()}`,
      userId: currentUser?.id,
      ownerCampusId: currentUser?.campusId,
      title: formData.title.trim(),
      category: formData.category,
      type: formData.type,
      description: formData.description.trim(),
      tags: parsedTags,
      price: formData.price.trim() || (formData.type === 'offering' ? 'Free / Negotiable' : 'Seeking'),
      contactName: formData.contactName.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      campusLocation: formData.campusLocation.trim(),
      createdAt: 'Just now',
      conditionOrUrgency: formData.conditionOrUrgency.trim() || undefined,
      imageUrl: formData.imageUrl || undefined,
      saved: false,
      contactVisibility: formData.contactVisibility,
      publicContactDisplay: formData.contactVisibility === 'public' ? formData.publicContactDisplay : undefined,
    };

    onSubmit(newListing, false);
    onClose();
    // Reset form
    setFormData({
      title: '',
      category: 'resources',
      type: 'offering',
      description: '',
      tags: '',
      price: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      campusLocation: '',
      conditionOrUrgency: '',
      imageUrl: '',
      contactVisibility: 'approval_required',
      publicContactDisplay: 'both',
    });
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 z-10"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  {isEditMode ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {isEditMode ? 'Edit Your Listing' : 'Post on CampusShare'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isEditMode
                      ? 'Update item details, pricing, tags or contact privacy'
                      : 'Share resources, services or opportunities with students'}
                  </p>
                </div>
              </div>
              <button
                id="post-modal-close-btn"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Type Selection (Offering vs Looking For) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Listing Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="post-type-offering"
                    onClick={() => setFormData({ ...formData, type: 'offering' })}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.type === 'offering'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    I am Offering / Giving
                  </button>
                  <button
                    type="button"
                    id="post-type-looking-for"
                    onClick={() => setFormData({ ...formData, type: 'looking_for' })}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.type === 'looking_for'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    I am Looking For / Seeking
                  </button>
                </div>
              </div>

              {/* Pillar Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Campus Pillar Category *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    id="post-cat-resources"
                    onClick={() => setFormData({ ...formData, category: 'resources' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.category === 'resources'
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                      <Package className="w-4 h-4" /> Resources
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Textbooks, cycles, lab kits, gear
                    </p>
                  </button>

                  <button
                    type="button"
                    id="post-cat-services"
                    onClick={() => setFormData({ ...formData, category: 'services' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.category === 'services'
                        ? 'bg-amber-50/70 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
                      <Wrench className="w-4 h-4" /> Services
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Tutoring, shifting, coding, design
                    </p>
                  </button>

                  <button
                    type="button"
                    id="post-cat-opportunities"
                    onClick={() => setFormData({ ...formData, category: 'opportunities' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.category === 'opportunities'
                        ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-1">
                      <Target className="w-4 h-4" /> Opportunities
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Study groups, project partners, jobs
                    </p>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item / Service Title *
                </label>
                <input
                  type="text"
                  id="post-title-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Stewart Calculus 9th Edition or CS61B Tutoring"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    errors.title
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.title}
                  </p>
                )}
              </div>

              {/* Price / Compensation & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price / Rate / Terms
                  </label>
                  <input
                    type="text"
                    id="post-price-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. Free, $20, $15/hr, Trade"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Condition / Timing / Urgency
                  </label>
                  <input
                    type="text"
                    id="post-condition-input"
                    value={formData.conditionOrUrgency}
                    onChange={(e) => setFormData({ ...formData, conditionOrUrgency: e.target.value })}
                    placeholder="e.g. Like New, Flexible, Urgent"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {/* Image Uploadation by Owner */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item / Post Photo (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />

                {formData.imageUrl ? (
                  <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                    <img
                      src={formData.imageUrl}
                      alt="Post preview"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Post image attached</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Students will see this photo on the listing card</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Photo
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
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-slate-700">
                        <span className="font-semibold text-indigo-600">Click to upload photo</span> or drag & drop
                      </div>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>
                )}
                {errors.image && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.image}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  id="post-description-input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the item, service scope, schedule, or partnership expectations..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    errors.description
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.description}
                  </p>
                )}
              </div>

              {/* Tags & Campus Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Campus Location / Dorm *
                  </label>
                  <input
                    type="text"
                    id="post-location-input"
                    value={formData.campusLocation}
                    onChange={(e) => setFormData({ ...formData, campusLocation: e.target.value })}
                    placeholder="e.g. North Quad Dorm B, Main Library"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      errors.campusLocation
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                    }`}
                  />
                  {errors.campusLocation && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.campusLocation}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    id="post-tags-input"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. Textbook, Math, Calculus"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {/* Contact Information & Privacy Preferences */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Student Contact Details
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Auto-filled from Campus ID profile
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        id="post-contact-name"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="Your Name *"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                          errors.contactName ? 'border-red-400' : 'border-slate-300 focus:border-indigo-500'
                        }`}
                      />
                      {errors.contactName && (
                        <p className="text-[10px] text-red-500 mt-0.5">{errors.contactName}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        id="post-contact-email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="Campus Email *"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                          errors.contactEmail ? 'border-red-400' : 'border-slate-300 focus:border-indigo-500'
                        }`}
                      />
                      {errors.contactEmail && (
                        <p className="text-[10px] text-red-500 mt-0.5">{errors.contactEmail}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        id="post-contact-phone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="WhatsApp / Phone *"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                          errors.contactPhone ? 'border-red-400' : 'border-slate-300 focus:border-indigo-500'
                        }`}
                      />
                      {errors.contactPhone && (
                        <p className="text-[10px] text-red-500 mt-0.5">{errors.contactPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Privacy & Visibility Preference */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Contact Visibility &amp; Approval Setting *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Choose whether your contact details are kept private until you approve a student&apos;s request, or displayed publicly to everyone right away.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Protected - Approval Required */}
                    <button
                      type="button"
                      id="privacy-opt-approval"
                      onClick={() => setFormData({ ...formData, contactVisibility: 'approval_required' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.contactVisibility === 'approval_required'
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          Display after accepting request
                        </span>
                        {formData.contactVisibility === 'approval_required' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        🔒 Contact details remain hidden until you review and approve incoming student notes.
                      </p>
                    </button>

                    {/* Option 2: Public - Instant Display */}
                    <button
                      type="button"
                      id="privacy-opt-public"
                      onClick={() => setFormData({ ...formData, contactVisibility: 'public' })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.contactVisibility === 'public'
                          ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                          <Globe className="w-3.5 h-3.5 text-indigo-600" />
                          Display publicly to everyone
                        </span>
                        {formData.contactVisibility === 'public' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        🌐 Instant contact. Students can view and reach out to you directly without waiting.
                      </p>
                    </button>
                  </div>

                  {/* Sub-Selection: If user chose Publicly, ask what to display: Phone, Email, or Both */}
                  {formData.contactVisibility === 'public' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 border-t border-indigo-100/80 mt-2"
                    >
                      <label className="block text-xs font-semibold text-indigo-950 mb-1.5">
                        Which contact channels should be displayed publicly?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          id="public-display-both"
                          onClick={() => setFormData({ ...formData, publicContactDisplay: 'both' })}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                            formData.publicContactDisplay === 'both'
                              ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 font-bold">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" /> + <Phone className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <span className="text-[11px]">Both Email &amp; Phone</span>
                        </button>

                        <button
                          type="button"
                          id="public-display-email-only"
                          onClick={() => setFormData({ ...formData, publicContactDisplay: 'email_only' })}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                            formData.publicContactDisplay === 'email_only'
                              ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 font-bold">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Only</span>
                          </div>
                          <span className="text-[11px] opacity-90">Keeps phone hidden</span>
                        </button>

                        <button
                          type="button"
                          id="public-display-phone-only"
                          onClick={() => setFormData({ ...formData, publicContactDisplay: 'phone_only' })}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                            formData.publicContactDisplay === 'phone_only'
                              ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 font-bold">
                            <Phone className="w-3.5 h-3.5" />
                            <span>Phone / WhatsApp Only</span>
                          </div>
                          <span className="text-[11px] opacity-90">Keeps email hidden</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Submit & Cancel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  id="post-cancel-btn"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="post-submit-btn"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
                >
                  {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEditMode ? 'Save Changes' : 'Publish Listing'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
