import { supabase } from './supabase';

export function mapRoom(row) {
  if (!row) return null;
  return {
    ...row,
    code: row.code,
    host: row.host_name || row.host || 'Host',
    hostTeam: row.host_team || 'HOST',
    hostMemberId: row.host_member_id || row.host || null,
    index: Number(row.current_index ?? row.current_set ?? 0),
    bid: Number(row.current_bid ?? 0),
    bidder: row.current_bidder || null,
    timerSeconds: Number(row.timer_seconds ?? 20),
  };
}

async function optionalQuery(query, fallback = []) {
  const result = await query;
  return result.error ? { data: fallback, error: null } : result;
}

export async function loadRoom(code) {
  const room = await supabase.from('rooms').select('*').eq('code', code).maybeSingle();
  if (room.error) throw room.error;
  if (!room.data) return { room: null, members: [], sold: [], chat: [] };

  const [members, sold, messages] = await Promise.all([
    optionalQuery(
      supabase.from('room_members').select('*').eq('room_code', code).order('joined_at'),
      [],
    ),
    optionalQuery(
      supabase.from('sold_players').select('*').eq('room_code', code).order('sold_at'),
      [],
    ),
    optionalQuery(
      supabase.from('room_messages').select('*').eq('room_code', code).order('created_at').limit(60),
      [],
    ),
  ]);

  return {
    room: mapRoom(room.data),
    members: members.data || [],
    sold: sold.data || [],
    chat: messages.data || [],
  };
}
