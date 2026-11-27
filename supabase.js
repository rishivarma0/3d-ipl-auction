import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export async function ensureUser() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;
  const { data: d, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return d.user;
}
