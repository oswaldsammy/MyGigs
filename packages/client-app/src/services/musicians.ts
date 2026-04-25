import { supabase } from '@mygigs/shared';
import type { MusicianProfileRow, UserRow, ReviewRow } from '@mygigs/shared';

export type MusicianListItem = MusicianProfileRow & { user: UserRow };

export const fetchTopMusicians = async (limit = 8): Promise<MusicianListItem[]> => {
  const { data, error } = await supabase
    .from('musician_profiles')
    .select('*, user:users!musician_profiles_id_fkey(*)')
    .eq('is_active', true)
    .order('avg_rating', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as MusicianListItem[];
};

export interface SearchParams {
  genre?: string;
  instrument?: string;
  city?: string;
  minRating?: number;
  maxRate?: number;
  sort?: 'relevance' | 'rating' | 'price_asc' | 'price_desc';
  limit?: number;
}

export const searchMusicians = async (p: SearchParams): Promise<MusicianListItem[]> => {
  let q = supabase
    .from('musician_profiles')
    .select('*, user:users!musician_profiles_id_fkey(*)')
    .eq('is_active', true);

  if (p.genre) q = q.contains('genres', [p.genre]);
  if (p.instrument) q = q.contains('instruments', [p.instrument]);
  if (p.minRating) q = q.gte('avg_rating', p.minRating);
  if (p.maxRate) q = q.lte('hourly_rate', p.maxRate);

  if (p.sort === 'rating') q = q.order('avg_rating', { ascending: false, nullsFirst: false });
  else if (p.sort === 'price_asc') q = q.order('hourly_rate', { ascending: true });
  else if (p.sort === 'price_desc') q = q.order('hourly_rate', { ascending: false });

  q = q.limit(p.limit ?? 30);
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []) as unknown as MusicianListItem[];
  if (p.city) {
    const c = p.city.toLowerCase();
    rows = rows.filter((r) => (r.user?.city ?? '').toLowerCase().includes(c));
  }
  return rows;
};

export const fetchMusicianById = async (id: string): Promise<MusicianListItem | null> => {
  const { data, error } = await supabase
    .from('musician_profiles')
    .select('*, user:users!musician_profiles_id_fkey(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as MusicianListItem | null;
};

export const fetchMusicianReviews = async (musicianId: string): Promise<ReviewRow[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('musician_id', musicianId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
};
