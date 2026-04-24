import type {
  UserRow,
  MusicianProfileRow,
  BookingRow,
  ReviewRow,
  MessageRow,
  QuoteRow,
  NotificationRow,
  KycDocumentRow,
} from './database';

export type User = UserRow;
export type MusicianProfile = MusicianProfileRow & { user?: UserRow };
export type Booking = BookingRow & {
  client?: UserRow;
  musician?: MusicianProfile;
};
export type Review = ReviewRow;
export type Message = MessageRow;
export type Quote = QuoteRow;
export type Notification = NotificationRow;
export type KycDocument = KycDocumentRow;

export interface SearchFilters {
  genre?: string;
  instrument?: string;
  city?: string;
  minRate?: number;
  maxRate?: number;
}
