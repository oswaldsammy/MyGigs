import { supabase } from '@mygigs/shared';

export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUpClient = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Signup did not return a user id');
  const { error: profileError } = await supabase.from('users').insert({
    id: userId,
    role: 'client',
    full_name: fullName,
  });
  if (profileError) throw profileError;
  return data;
};
