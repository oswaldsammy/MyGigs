import { supabase } from '@mygigs/shared';

export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUpMusician = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Signup did not return a user id');
  const { error: userError } = await supabase.from('users').insert({
    id: userId,
    role: 'musician',
    full_name: fullName,
  });
  if (userError) throw userError;
  const { error: profileError } = await supabase.from('musician_profiles').insert({
    id: userId,
    is_active: true,
    is_verified: false,
    kyc_status: 'pending',
    total_reviews: 0,
  });
  if (profileError) throw profileError;
  return data;
};
