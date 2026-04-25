import { supabase } from '@mygigs/shared';
import type { UserRow } from '@mygigs/shared';

export const getMyUser = async (): Promise<UserRow | null> => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data, error } = await supabase.from('users').select('*').eq('id', u.user.id).maybeSingle();
  if (error) throw error;
  return data as UserRow | null;
};

export const updateMyUser = async (patch: Partial<UserRow>) => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Not authenticated');
  const { error } = await supabase.from('users').update(patch).eq('id', u.user.id);
  if (error) throw error;
};
