'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEAMS = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'GT', 'LSG', 'PBKS', 'RR', 'SRH'];
const COLORS = { CSK:'#f9cd05', MI:'#2d7be5', RCB:'#e62d3f', KKR:'#8b62d9', DC:'#4c9cff', GT:'#6c87a8', LSG:'#00a3ad', PBKS:'#e83b47', RR:'#ea4b9d', SRH:'#ff822a' };

function makeRoom(code, name, team) {
  return { code, status:'auction', host:name, hostTeam:team, current:0, bid:0, bidder:null, sold:[], teams:{ [team]:name }, players:0, createdAt:Date.now() };
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const start = (join) => {
    if (!name.trim() || !team) return setError('Add your name and choose a team.');
    const roomCode = join ? code.trim().toUpperCase() : Math.random().toString(36).slice(2, 7).toUpperCase();
    if (join && roomCode.length !== 5) return setError('Enter a five-character room code.');
    const room = join ? JSON.parse(localStorage.getItem(`ipl-room:${roomCode}`) || 'null') : makeRoom(roomCode, name.trim(), team);
    if (!room) return setError('That room does not exist in this browser. Create a room first.');
    room.teams = { ...(room.teams || {}), [team]:name.trim() };
    localStorage.setItem(`ipl-player:${roomCode}`, JSON.stringify({ name:name.trim(), team }));
    localStorage.setItem(`ipl-room:${roomCode}`, JSON.stringify(room));
    router.push(`/room/${roomCode}`);
  };
  return <main className="home shell">
    <div className="eyebrow">IPL AUCTION ARENA · SEASON 2026</div>
    <h1>Build a squad.<br/><span>Own the season.</span></h1>
    <p className="lede">A fast, tactile mega-auction experience for your cricket crew — with a 3D auction stage, live bids and a knockout finish.</p>
    <section className="card form-card">
      <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rishi" maxLength={24}/></label>
      <label>Choose your franchise<div className="team-grid">{TEAMS.map(t=><button key={t} className={team===t?'team selected':'team'} style={{'--team':COLORS[t]}} onClick={()=>setTeam(t)}>{t}</button>)}</div></label>
      <button className="primary" onClick={()=>start(false)}>Create auction room <span>→</span></button>
      <div className="divider"><span>OR JOIN A CREW</span></div>
      <div className="join"><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={5}/><button className="secondary" onClick={()=>start(true)}>Join</button></div>
      {error && <p className="error">{error}</p>}
    </section>
    <p className="footnote">Runs locally in your browser · Open the room in another tab to test a second franchise</p>
  </main>;
}
