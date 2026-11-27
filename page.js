'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, ensureUser } from '@/lib/supabase';
import { TEAMS } from '@/lib/teams';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { ensureUser().catch((e) => setErr(e.message)); }, []);

  const go = async (fn, args) => {
    if (!name.trim() || !team) return setErr('Enter your name and pick a team first');
    setBusy(true); setErr('');
    const { data, error } = await supabase.rpc(fn, args);
    setBusy(false);
    if (error) return setErr(error.message);
    router.push('/room/' + data);
  };

  return (
    <div className="wrap">
      <h1>🏏 IPL Auction</h1>
      <div className="mute">Mega auction with your friends. Build your squad, pick your XI, win the trophy.</div>
      <h2>Your name</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" maxLength={24} />
      <h2>Pick your team</h2>
      <div className="grid">
        {Object.keys(TEAMS).map((t) => (
          <button key={t} className={'chip' + (team === t ? ' on' : '')} style={{ borderLeft: `5px solid ${TEAMS[t].color}` }} onClick={() => setTeam(t)}>{t}</button>
        ))}
      </div>
      <button className="btn" disabled={busy} onClick={() => go('create_room', { p_name: name, p_team: team })}>Create room</button>
      <h2>Or join friends</h2>
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={5} />
      <button className="btn alt" disabled={busy || code.length < 5} onClick={() => go('join_room', { p_code: code, p_name: name, p_team: team })}>Join room</button>
      {err && <div className="err">{err}</div>}
    </div>
  );
}
