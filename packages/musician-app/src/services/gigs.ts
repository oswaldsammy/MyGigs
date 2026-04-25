import { supabase } from '@mygigs/shared';
import type { BookingStatus, QuoteRow } from '@mygigs/shared';

export const listGigs = async (status?: BookingStatus | 'all') => {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return [];
  let q = supabase
    .from('bookings')
    .select('*, client:users!bookings_client_id_fkey(*)')
    .eq('musician_id', uid)
    .order('event_date', { ascending: false });
  if (status && status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

export const fetchGigDetail = async (id: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, client:users!bookings_client_id_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const updateGigStatus = async (id: string, status: BookingStatus, declineReason?: string) => {
  const patch: any = { status };
  if (declineReason) patch.decline_reason = declineReason;
  const { error } = await supabase.from('bookings').update(patch).eq('id', id);
  if (error) throw error;
};

export const fetchQuotesForBooking = async (bookingId: string): Promise<QuoteRow[]> => {
  const { data } = await supabase.from('quotes').select('*').eq('booking_id', bookingId);
  return (data ?? []) as QuoteRow[];
};

export const sendQuote = async (
  bookingId: string,
  amount: number,
  message: string,
  expiresHours: number,
) => {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error('Not authenticated');

  // expire any existing pending quotes
  await supabase.from('quotes').update({ status: 'expired' })
    .eq('booking_id', bookingId).eq('status', 'pending');

  const expires = new Date(Date.now() + expiresHours * 3600_000).toISOString();
  const { error } = await supabase.from('quotes').insert({
    booking_id: bookingId,
    musician_id: uid,
    amount,
    message,
    expires_at: expires,
    status: 'pending',
  });
  if (error) throw error;

  await supabase.from('bookings').update({ status: 'negotiating' }).eq('id', bookingId);

  // notify client
  const { data: b } = await supabase.from('bookings').select('client_id').eq('id', bookingId).single();
  if (b?.client_id) {
    await supabase.from('notifications').insert({
      user_id: b.client_id,
      type: 'quote.received',
      title: 'You received a quote',
      meta: { booking_id: bookingId },
    });
  }
};
