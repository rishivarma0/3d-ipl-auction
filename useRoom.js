'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, ensureUser } from '@/lib/supabase';

export function useRoom(id) {
  const [st, setSt] = useState({ loading: true, me: null, room: null, members: [], squads: [], matches: [], myXi: {}, standings: [], players: {} });
  const playersRef = useRef(null);

  const reload = useCallback(async () => {
    try {
      const user = await ensureUser();
      if (!playersRef.current) {
        const { data } = await supabase.from('players').select('*');
        playersRef.current = Object.fromEntries((data || []).map((p) => [p.id, p]));
      }
      const [r, m, s, mt] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', id).maybeSingle(),
        supabase.from('room_members').select('*').eq('room_id', id),
        supabase.from('squads').select('*').eq('room_id', id),
        supabase.from('matches').select('*').eq('room_id', id).order('round'),
      ]);
      const room = r.data;
      const matches = mt.data || [];
      let myXi = {}, standings = [];
      if (room && matches.length) {
        const ids = matches.map((x) => x.id);
        const { data } = await supabase.from('match_xi').select('*').eq('user_id', user.id).in('match_id', ids);
        myXi = Object.fromEntries((data || []).map((x) => [x.match_id, x.players]));
      }
      if (room && (room.status === 'tournament' || room.status === 'done')) {
        const { data } = await supabase.rpc('standings', { p_room: id });
        standings = data || [];
      }
      setSt({ loading: false, me: user, room, members: m.data || [], squads: s.data || [], matches, myXi, standings, players: playersRef.current });
    } catch (e) {
      setSt((x) => ({ ...x, loading: false, error: e.message }));
    }
  }, [id]);

  useEffect(() => {
    reload();
    const ch = supabase
      .channel('room-' + id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${id}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${id}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'squads', filter: `room_id=eq.${id}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `room_id=eq.${id}` }, reload)
      .subscribe();
    const poll = setInterval(reload, 4000);
    return () => { clearInterval(poll); supabase.removeChannel(ch); };
  }, [id, reload]);

  return { ...st, reload };
}
