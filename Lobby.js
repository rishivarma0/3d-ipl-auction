'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TEAMS } from '@/lib/teams';

export default function Lobby({ s }) {
  const { room, members, me } = s;
  const [err, setErr] = useState('');
  const isHost = room.host === me.id;
  const start = async () => {
    const { error } = await supabase.rpc('start_auction', { p_room: room.id });
    if (error) setErr(error.message); else s.reload();
  };
  const share = () => {
    const text = `Join my IPL auction! Room code: ${room.code}  ${location.origin}`;
    if (navigator.share) navigator.share({ text }).catch(() => {}); else navigator.clipboard?.writeText(text);
  };
  return (
    <>
      <h1>Lobby</h1>
      <div className="mute">Share this code with your friends</div>
      <div className="code">{room.code}</div>
      <button className="btn alt" onClick={share}>Share invite</button>
      <h2>Teams in this auction ({members.length})</h2>
      <div className="panel">
        {members.map((m) => (
          <div className="row" key={m.user_id}>
            <span><span className="dot" style={{ background: TEAMS[m.team].color }} />{m.team} · {m.name}</span>
            <span className="mute">{m.user_id === room.host ? 'Host' : ''}</span>
          </div>
        ))}
      </div>
      <div className="mute">Only the teams that join take part. Everyone starts with ₹120 Cr.</div>
      {isHost ? (
        <button className="btn" disabled={members.length < 2} onClick={start}>Start auction</button>
      ) : (
        <div className="panel mute">Waiting for the host to start…</div>
      )}
      {err && <div className="err">{err}</div>}
    </>
  );
}
