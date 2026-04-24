import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import type { UserRole } from '../types/database';

export interface AuthState {
  user: SupabaseUser | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (u: SupabaseUser | null) => {
      if (!active) return;
      setUser(u);
      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('users').select('role').eq('id', u.id).maybeSingle();
      if (!active) return;
      setRole((data?.role as UserRole) ?? null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, role, loading, signOut };
};
