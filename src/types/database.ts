export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "client" | "admin";
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  max_guests: number;
  max_photos: number;
  features: PackageFeatures;
  created_at: string;
}

export interface PackageFeatures {
  templates: string;
  linkDuration: string;
  guests: string;
  photos: string;
  qrCode: boolean;
  map: boolean;
  backgroundMusic: string;
  rsvp: boolean;
  countdown: boolean;
  watermark: boolean;
  support: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  package_id: string;
  status: "active" | "expired" | "cancelled";
  started_at: string;
  expires_at: string;
  payment_id: string | null;
  created_at: string;
  package?: Package;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

export interface Invitation {
  id: string;
  user_id: string;
  slug: string;
  type?: "wedding" | "birthday" | null;
  template_id: string | null;
  groom_name: string;
  groom_name_kh: string | null;
  groom_photo: string | null;
  bride_name: string;
  bride_name_kh: string | null;
  bride_photo: string | null;
  wedding_date: string;
  ceremony_time: string | null;
  reception_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_map_url: string | null;
  story: string | null;
  quote: string | null;
  background_music: string | null;
  video_url: string | null;
  timeline: TimelineEvent[];
  dress_code: string | null;
  dress_code_color: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  template?: Template;
  guests?: Guest[];
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  category: string;
  is_premium: boolean;
  config: Record<string, unknown> | null;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  invitation_id: string;
  url: string;
  caption: string | null;
  order_index: number;
  created_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  custom_link: string;
  share_code?: string | null;
  side: "groom" | "bride" | "both" | null;
  table_number: number | null;
  created_at: string;
  rsvp?: RSVP;
}

export interface RSVP {
  id: string;
  guest_id: string;
  invitation_id: string;
  status: "pending" | "attending" | "not_attending" | "maybe";
  number_of_guests: number;
  message: string | null;
  attending_ceremony: boolean;
  attending_reception: boolean;
  created_at: string;
  updated_at: string;
  guest?: Guest;
}

export interface Wish {
  id: string;
  invitation_id: string;
  guest_id: string | null;
  sender_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface QRCode {
  id: string;
  invitation_id: string;
  type: "gift" | "cash";
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  qr_image_url: string | null;
  khqr_payload: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  payment_method: "khqr" | "receipt_upload" | null;
  payment_proof_url: string | null;
  khqr_reference: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  package?: Package;
  user?: User;
}
