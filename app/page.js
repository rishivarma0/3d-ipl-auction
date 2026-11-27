'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { memberId } from '../lib/supabase';

const TEAMS = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'GT', 'LSG', 'PBKS', 'RR', 'SRH'];
const COLORS = { CSK:'#f9cd05', MI:'#2d7be5', RCB:'#e62d3f', KKR:'#8b62d9', DC:'#4c9cff', GT:'#6c87a8', LSG:'#00a3ad', PBKS:'#e83b47', RR:'#ea4b9d', SRH:'#ff822a' };

function makeRoom(code, name, team) {
  return { code, status:'auction', host:name, hostTeam:team, current:0, index:0, bid:0, bidder:null, sold:[], teams:{ [team]:name }, players:0, timerSeconds:20, paused:false, chat:[], createdAt:Date.now() };
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const start = async (join) => {
    if (!name.trim() || !team) return setError('Add your name and choose a team.');
    const roomCode = join ? code.trim().toUpperCase() : Math.random().toString(36).slice(2, 7).toUpperCase();
    if (join && roomCode.length !== 5) return setError('Enter a five-character room code.');
    setBusy(true); setError('');
    const id = memberId();
    const { data, error: rpcError } = await supabase.rpc(join ? 'join_room' : 'create_room', join ? { p_code:roomCode, p_member_id:id, p_name:name.trim(), p_team:team } : { p_code:roomCode, p_member_id:id, p_name:name.trim(), p_team:team, p_timer_seconds:20 });
    setBusy(false);
    if (rpcError) return setError(rpcError.message);
    localStorage.setItem(`ipl-player:${roomCode}`, JSON.stringify({ memberId:id, name:name.trim(), team }));
    router.push(`/room/${roomCode}`);
  };
  return <main className="home shell">
    <div className="eyebrow">SEASON 2026</div>
    <h1>IPL <span>MEGA AUCTION</span></h1>
    <section className="card form-card">
      <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="" maxLength={24}/></label>
      <label>Choose your franchise<div className="team-grid">{TEAMS.map(t=><button key={t} className={team===t?'team selected':'team'} style={{'--team':COLORS[t]}} onClick={()=>setTeam(t)}>{t}</button>)}</div></label>
      <button className="primary" disabled={busy} onClick={()=>start(false)}>Create auction room <span>→</span></button>
      <div className="divider"><span>OR JOIN A CREW</span></div>
      <div className="join"><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={5}/><button className="secondary" disabled={busy} onClick={()=>start(true)}>Join</button></div>
      {error && <p className="error">{error}</p>}
    </section>
    <p className="footnote">Runs locally in your browser · Open the room in another tab to test a second franchise</p>
  </main>;
}
