import { supabase } from '@mygigs/shared';
import type { MusicianProfileRow, UserRow } from '@mygigs/shared';

export const getMyUser = async (): Promise<UserRow | null> => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from('users').select('*').eq('id', u.user.id).maybeSingle();
  return data as UserRow | null;
};

export const updateMyUser = async (patch: Partial<UserRow>) => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Not authenticated');
  const { error } = await supabase.from('users').update(patch).eq('id', u.user.id);
  if (error) throw error;
};

export const getMyMusician = async (): Promise<MusicianProfileRow | null> => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from('musician_profiles').select('*').eq('id', u.user.id).maybeSingle();
  return data as MusicianProfileRow | null;
};

export const updateMyMusician = async (patch: Partial<MusicianProfileRow>) => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Not authenticated');
  const { error } = await supabase.from('musician_profiles').update(patch).eq('id', u.user.id);
  if (error) throw error;
};
