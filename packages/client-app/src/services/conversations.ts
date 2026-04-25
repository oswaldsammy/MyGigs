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

export const listClientConversations = async (): Promise<Conversation[]> => {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return [];

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, event_date, musician_id, musician:musician_profiles(id, user:users!musician_profiles_id_fkey(full_name, avatar_url))')
    .eq('client_id', uid)
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
      otherName: b.musician?.user?.full_name ?? 'Musician',
      otherAvatar: b.musician?.user?.avatar_url ?? null,
      eventDate: b.event_date,
      lastMessage: last?.content ?? null,
      lastTime: last?.created_at ?? null,
      unread,
    });
  }
  return result;
};
