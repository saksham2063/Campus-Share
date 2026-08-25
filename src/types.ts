export type PillarCategory = 'resources' | 'services' | 'opportunities';
export type ListingType = 'offering' | 'looking_for';

export type ContactVisibility = 'approval_required' | 'public';
export type PublicContactDisplay = 'both' | 'email_only' | 'phone_only';

export interface UserAccount {
  id: string;
  campusId: string;
  name: string;
  email: string;
  department: string;
  campusLocation: string;
  phone?: string;
  password?: string;
  avatarBg?: string;
  createdAt: string;
  role?: 'student' | 'admin';
  isAdmin?: boolean;
}

export interface Listing {
  id: string;
  userId?: string;
  ownerCampusId?: string;
  title: string;
  category: PillarCategory;
  type: ListingType;
  description: string;
  tags: string[];
  price: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  campusLocation: string;
  createdAt: string;
  conditionOrUrgency?: string;
  imageUrl?: string;
  saved?: boolean;
  contactVisibility?: ContactVisibility;
  publicContactDisplay?: PublicContactDisplay;
}

export interface NewListingFormData {
  title: string;
  category: PillarCategory;
  type: ListingType;
  description: string;
  tags: string;
  price: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  campusLocation: string;
  conditionOrUrgency: string;
  imageUrl?: string;
  contactVisibility: ContactVisibility;
  publicContactDisplay: PublicContactDisplay;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface ConnectionRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCategory: PillarCategory;
  ownerUserId?: string;
  ownerCampusId?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  senderUserId?: string;
  senderCampusId?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  note: string;
  attachmentImage?: string;
  status: ConnectionStatus;
  createdAt: string;
  isIncoming?: boolean;
}

export type NotificationType = 'request_approved' | 'request_declined' | 'new_request_received';

export interface UserNotification {
  id: string;
  recipientUserId: string;
  recipientCampusId?: string;
  requestId: string;
  listingId: string;
  listingTitle: string;
  listingCategory: PillarCategory;
  type: NotificationType;
  title: string;
  message: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  read: boolean;
  createdAt: string;
}

