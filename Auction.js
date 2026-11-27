'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { money, step, ROLE } from '@/lib/format';
import { TEAMS } from '@/lib/teams';

const Stage = dynamic(() => import('./Stage'), { ssr: false, loading: () => <div className="stage" /> });
const colors = Object.fromEntries(Object.entries(TEAMS).map(([k, v]) => [k, v.color]));

export default function Auction({ s }) {
  const { room, members, squads, players, me } = s;
  const p = players[room.current_player_id];
  const mine = members.find((m) => m.user_id === me.id);
  const next = p ? (room.current_bid == null ? p.base : room.current_bid + step(room.current_bid)) : 0;
  const leader = members.find((m) => m.user_id === room.current_bidder);
  const iLead = room.current_bidder === me.id;
  const [left, setLeft] = useState(20);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState(null);
  const resolving = useRef(false);
  const prev = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      const ms = new Date(room.lot_ends_at).getTime() - Date.now();
      setLeft(Math.max(0, Math.ceil(ms / 1000)));
      if (ms <= 0 && !resolving.current) {
        resolving.current = true;
        supabase.rpc('resolve_lot', { p_room: room.id }).then(() => s.reload()).finally(() => setTimeout(() => { resolving.current = false; }, 900));
      }
    }, 250);
    return () => clearInterval(t);
  }, [room.lot_ends_at, room.id]);

  useEffect(() => {
    const old = prev.current;
    if (old && old !== room.current_player_id) {
      const sq = squads.find((x) => x.player_id === old);
      const t = sq && members.find((m) => m.user_id === sq.user_id);
      setToast(sq ? `SOLD! ${players[old]?.name} → ${t?.team} for ${money(sq.price)}` : `UNSOLD: ${players[old]?.name}`);
      setTimeout(() => setToast(null), 3500);
    }
    prev.current = room.current_player_id;
  }, [room.current_player_id]);

  const bid = async () => {
    setErr('');
    const { error } = await supabase.rpc('place_bid', { p_room: room.id, p_amount: next });
    if (error) setErr(error.message); else s.reload();
  };

  const mySquad = squads.filter((x) => x.user_id === me.id);
  const over = mySquad.filter((x) => players[x.player_id]?.overseas).length;
  if (!p) return <div className="mute">Loading next player…</div>;

  return (
    <>
      <div className="stage">
        <Stage role={p.role} members={members} leaderId={room.current_bidder} colors={colors} />
        {toast && <div className="toast">{toast}</div>}
      </div>
      <div className="panel lot">
        <div className="name">{p.name}</div>
        <span className="tag">{ROLE[p.role]}</span><span className="tag">{p.country}</span>
        {p.overseas && <span className="tag">Overseas ✈️</span>}
        <span className="tag">Base {money(p.base)}</span>
        <div className="big">{room.current_bid == null ? 'No bids yet' : money(room.current_bid)}</div>
        <div className="mute">{leader ? <><span className="dot" style={{ background: TEAMS[leader.team].color }} />{leader.team} leads</> : 'Be the first to bid'}</div>
        <div className={'timer' + (left <= 5 ? ' low' : '')}>⏱ {left}s</div>
      </div>
      {err && <div className="err">{err}</div>}
      <h2>Teams</h2>
      <div className="panel">
        {members.map((m) => (
          <div className="row" key={m.user_id}>
            <span><span className="dot" style={{ background: TEAMS[m.team].color }} />{m.team} {m.user_id === me.id ? '(you)' : ''}</span>
            <span className="mute">{squads.filter((x) => x.user_id === m.user_id).length} players · {money(m.purse)}</span>
          </div>
        ))}
      </div>
      <details className="panel">
        <summary>My squad ({mySquad.length}/25 · overseas {over}/8)</summary>
        {mySquad.map((x) => (
          <div className="row" key={x.player_id}><span>{players[x.player_id]?.name}</span><span className="mute">{money(x.price)}</span></div>
        ))}
      </details>
      <div className="sticky">
        <button className="btn" disabled={iLead || left === 0 || !mine || next > mine.purse} onClick={bid}>
          {iLead ? 'You lead' : `BID ${money(next)}`}
        </button>
      </div>
    </>
  );
}
