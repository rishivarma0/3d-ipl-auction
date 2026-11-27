'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { money } from '@/lib/format';
import { TEAMS } from '@/lib/teams';

export default function AuctionDone({ s }) {
  const { room, members, squads, players, me } = s;
  const [err, setErr] = useState('');
  const isHost = room.host === me.id;
  const go = async () => {
    const { error } = await supabase.rpc('start_tournament', { p_room: room.id });
    if (error) setErr(error.message); else s.reload();
  };
  return (
    <>
      <h1>🎉 Auction complete</h1>
      {members.map((m) => {
        const sq = squads.filter((x) => x.user_id === m.user_id);
        return (
          <details className="panel" key={m.user_id} open={m.user_id === me.id}>
            <summary><span className="dot" style={{ background: TEAMS[m.team].color }} />{m.team} · {sq.length} players · {money(m.purse)} left</summary>
            {sq.map((x) => (
              <div className="row" key={x.player_id}><span>{players[x.player_id]?.name}</span><span className="mute">{money(x.price)}</span></div>
            ))}
          </details>
        );
      })}
      <div className="mute">Teams short of a keeper, bowlers or 11 players are topped up with free unsold players when the tournament starts.</div>
      {isHost ? <button className="btn" onClick={go}>Start tournament</button> : <div className="panel mute">Waiting for the host to start the tournament…</div>}
      {err && <div className="err">{err}</div>}
    </>
  );
}
