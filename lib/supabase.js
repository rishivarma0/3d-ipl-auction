import { createClient } from '@supabase/supabase-js';

const url = 'https://yiotsbkhqbbxqizhplrj.supabase.co';
const key = 'sb_publishable_O9yF__VAJZzF1TaWb8Z_BA_xma4lJlS';

export const supabase = createClient(url, key);

export function memberId() {
  if (typeof window === 'undefined') return '';
  const keyName = 'ipl-auction-member-id';
  let value = localStorage.getItem(keyName);
  if (!value) { value = crypto.randomUUID(); localStorage.setItem(keyName, value); }
  return value;
}
