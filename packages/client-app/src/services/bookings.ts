import { supabase } from '@mygigs/shared';
import type { BookingRow, BookingStatus, QuoteRow } from '@mygigs/shared';

export interface CreateBookingInput {
  musicianId: string;
  eventDate: string;
  startTime: string;
  durationHours: number;
  venueName: string;
  venueAddress: string;
  eventType: string;
  specialRequests?: string;
  hourlyRate: number;
}

export const createBooking = async (input: CreateBookingInput) => {
  const { data: userData } = await supabase.auth.getUser();
  const clientId = userData.user?.id;
  if (!clientId) throw new Error('Not authenticated');

  const subtotal = input.hourlyRate * input.durationHours;
  const platformFee = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + platformFee).toFixed(2);
  const payout = +(subtotal).toFixed(2);

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: clientId,
      musician_id: input.musicianId,
      event_date: input.eventDate,
      start_time: input.startTime,
      duration_hours: input.durationHours,
      venue_name: input.venueName,
      venue_address: input.venueAddress,
      event_type: input.eventType,
      special_requests: input.specialRequests ?? null,
      status: 'pending',
      total_amount: total,
      platform_fee: platformFee,
      musician_payout: payout,
      payment_status: 'unpaid',
    })
    .select()
    .single();
  if (error) throw error;

  await supabase.from('notifications').insert({
    user_id: input.musicianId,
    type: 'booking.new',
    title: 'New booking request',
    body: 'You have a new booking request to review',
    meta: { booking_id: data.id },
  });

  return data as BookingRow;
};

export const listMyBookings = async (status?: BookingStatus | 'all') => {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return [];
  let q = supabase
    .from('bookings')
    .select('*, musician:musician_profiles(*, user:users!musician_profiles_id_fkey(*))')
    .eq('client_id', uid)
    .order('event_date', { ascending: false });
  if (status && status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

export const fetchBookingDetail = async (id: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, musician:musician_profiles(*, user:users!musician_profiles_id_fkey(*)), client:users!bookings_client_id_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const fetchBookingQuotes = async (bookingId: string): Promise<QuoteRow[]> => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('booking_id', bookingId)
    .order('expires_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as QuoteRow[];
};

export const cancelBooking = async (id: string) => {
  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
};

export const acceptQuote = async (quoteId: string, bookingId: string) => {
  const { error: e1 } = await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
  if (e2) throw e2;
};

export const declineQuote = async (quoteId: string) => {
  const { error } = await supabase.from('quotes').update({ status: 'declined' }).eq('id', quoteId);
  if (error) throw error;
};
