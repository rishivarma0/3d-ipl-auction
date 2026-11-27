import { supabase } from './supabase';

export function mapRoom(row) {
  if (!row) return null;
  return { ...row, code:row.code, host:row.host_name, hostTeam:row.host_team, hostMemberId:row.host_member_id, index:row.current_index, bid:row.current_bid, bidder:row.current_bidder, timerSeconds:row.timer_seconds };
}

export async function loadRoom(code) {
  const [room, members, sold, messages] = await Promise.all([
    supabase.from('rooms').select('*').eq('code', code).maybeSingle(),
    supabase.from('room_members').select('*').eq('room_code', code).order('joined_at'),
    supabase.from('sold_players').select('*').eq('room_code', code).order('sold_at'),
    supabase.from('room_messages').select('*').eq('room_code', code).order('created_at').limit(60),
  ]);
  const error = room.error || members.error || sold.error || messages.error;
  if (error) throw error;
  return { room:mapRoom(room.data), members:members.data || [], sold:sold.data || [], chat:messages.data || [] };
}
