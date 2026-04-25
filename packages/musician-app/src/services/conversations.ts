import { supabase } from '@mygigs/shared';

export interface Conversation {
  bookingId: string;
  otherName: string;
  otherAvatar: string | null;
  eventDate: string;
  lastMessage: string | null;
  lastTime: string | null;
  unread: number;
}

export const listMusicianConversations = async (): Promise<Conversation[]> => {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return [];

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, event_date, client:users!bookings_client_id_fkey(full_name, avatar_url)')
    .eq('musician_id', uid)
    .order('event_date', { ascending: false });

  const result: Conversation[] = [];
  for (const b of (bookings ?? []) as any[]) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('content, created_at, sender_id, is_read')
      .eq('booking_id', b.id)
      .order('created_at', { ascending: false })
      .limit(20);
    const last = msgs?.[0];
    const unread = (msgs ?? []).filter((m: any) => !m.is_read && m.sender_id !== uid).length;
    result.push({
      bookingId: b.id,
      otherName: b.client?.full_name ?? 'Client',
      otherAvatar: b.client?.avatar_url ?? null,
      eventDate: b.event_date,
      lastMessage: last?.content ?? null,
      lastTime: last?.created_at ?? null,
      unread,
    });
  }
  return result;
};
