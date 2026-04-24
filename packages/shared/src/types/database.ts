export type UserRole = 'client' | 'musician';
export type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type KycDocType = 'id' | 'certificate' | 'portfolio' | 'bank';
export type KycDocStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'negotiating'
  | 'confirmed'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'unpaid' | 'held' | 'released' | 'refunded';
export type QuoteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface UserRow {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
}

export interface MusicianProfileRow {
  id: string;
  bio: string | null;
  genres: string[] | null;
  instruments: string[] | null;
  languages: string[] | null;
  hourly_rate: number | null;
  min_booking_hours: number | null;
  is_verified: boolean;
  kyc_status: KycStatus;
  profile_video_url: string | null;
  sample_tracks: { title: string; url: string }[] | null;
  availability: Record<string, string[]> | null;
  avg_rating: number | null;
  total_reviews: number;
  is_active: boolean;
}

export interface KycDocumentRow {
  id: string;
  musician_id: string;
  doc_type: KycDocType;
  file_url: string;
  status: KycDocStatus;
  reviewed_at: string | null;
}

export interface BookingRow {
  id: string;
  client_id: string;
  musician_id: string;
  event_date: string;
  start_time: string;
  duration_hours: number;
  venue_name: string | null;
  venue_address: string | null;
  event_type: string | null;
  special_requests: string | null;
  decline_reason: string | null;
  status: BookingStatus;
  total_amount: number | null;
  platform_fee: number | null;
  musician_payout: number | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  contract_url: string | null;
  created_at: string;
}

export interface QuoteRow {
  id: string;
  booking_id: string;
  musician_id: string;
  amount: number;
  message: string | null;
  expires_at: string | null;
  status: QuoteStatus;
}

export interface MessageRow {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  file_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  booking_id: string;
  client_id: string;
  musician_id: string;
  rating: number;
  review_text: string | null;
  musician_response: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  meta: Record<string, unknown> | null;
  created_at: string;
}

type Table<R, I = Partial<R>, U = Partial<R>> = { Row: R; Insert: I; Update: U };

export interface Database {
  public: {
    Tables: {
      users: Table<UserRow>;
      musician_profiles: Table<MusicianProfileRow>;
      kyc_documents: Table<KycDocumentRow>;
      bookings: Table<BookingRow>;
      quotes: Table<QuoteRow>;
      messages: Table<MessageRow>;
      reviews: Table<ReviewRow>;
      notifications: Table<NotificationRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      kyc_status: KycStatus;
      kyc_doc_type: KycDocType;
      kyc_doc_status: KycDocStatus;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      quote_status: QuoteStatus;
    };
  };
}
