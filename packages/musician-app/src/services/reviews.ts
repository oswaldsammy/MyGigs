import { supabase } from '@mygigs/shared';
import type { ReviewRow } from '@mygigs/shared';

export const listMyReviews = async (): Promise<ReviewRow[]> => {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return [];
  const { data } = await supabase.from('reviews').select('*').eq('musician_id', uid)
    .order('created_at', { ascending: false });
  return (data ?? []) as ReviewRow[];
};

export const respondToReview = async (id: string, response: string) => {
  const { error } = await supabase.from('reviews').update({ musician_response: response }).eq('id', id);
  if (error) throw error;
};
