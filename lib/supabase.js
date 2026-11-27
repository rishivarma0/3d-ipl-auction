import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(url, key);

export function memberId() {
  if (typeof window === 'undefined') return '';
  const keyName = 'ipl-auction-member-id';
  let value = localStorage.getItem(keyName);
  if (!value) { value = crypto.randomUUID(); localStorage.setItem(keyName, value); }
  return value;
}
