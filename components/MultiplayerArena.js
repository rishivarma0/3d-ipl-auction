'use client';
import { Component, useEffect,useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase,memberId } from '../lib/supabase';
import { loadRoom } from '../lib/roomApi';
import { PLAYERS } from '../lib/players';
const Stage=dynamic(()=>import('./Stage'),{ssr:false,loading:()=> <div className="stage loading">Loading arena…</div>});
const COLORS={CSK:'#f9cd05',MI:'#2d7be5',RCB:'#e62d3f',KKR:'#8b62d9',DC:'#4c9cff',GT:'#6c87a8',LSG:'#00a3ad',PBKS:'#e83b47',RR:'#ea4b9d',SRH:'#ff822a'};
const money=v=>v>=100?`₹${(v/100).toFixed(2)} Cr`:`₹${v} L`; const purse=s=>`₹${((12000-s)/100).toFixed(2)} Cr`; const role={BAT:'BATTER',WK:'KEEPER',AR:'ALL-ROUNDER',PACE:'PACER',SPIN:'SPINNER'};

function MultiplayerArena({code}){
 const [data,setData]=useState(null),[me,setMe]=useState(null),[error,setError]=useState('');
 const reload=async()=>{try{setData(await loadRoom(code))}catch(e){setError(e?.message||'Could not load this auction room.')}};
 useEffect(()=>{let p=null;try{p=JSON.parse(localStorage.getItem(`ipl-player:${code}`)||'null')}catch{}setMe(p);reload();const ch=supabase.channel(`room-${code}`).on('postgres_changes',{event:'*',schema:'public',table:'rooms',filter:`code=eq.${code}`},reload).on('postgres_changes',{event:'*',schema:'public',table:'room_members',filter:`room_code=eq.${code}`},reload).on('postgres_changes',{event:'*',schema:'public',table:'sold_players',filter:`room_code=eq.${code}`},reload).on('postgres_changes',{event:'*',schema:'public',table:'room_messages',filter:`room_code=eq.${code}`},reload).subscribe();const poll=setInterval(reload,4000);return()=>{clearInterval(poll);supabase.removeChannel(ch)}},[code]);
 if(error)return <main className="shell"><div className="card"><h2>{error}</h2><a href="/">← Back home</a></div></main>; if(!data||!me)return <main className="shell"><div className="card">Connecting to room…</div></main>; if(!data.room)return <main className="shell"><div className="card"><h2>Room not found</h2><p className="muted">This invite code is no longer active.</p><a href="/">← Back home</a></div></main>; return <Game code={code} data={data} me={me} reload={reload}/>;
}

function Game({code,data,me,reload}){
 const {room,members,sold,chat}=data; const p=PLAYERS[room.index]; const [time,setTime]=useState(room.timerSeconds); const [message,setMessage]=useState(''); const [notice,setNotice]=useState(''); const isHost=room.hostMemberId===me.memberId; const spent=t=>sold.filter(x=>x.team===t).reduce((a,x)=>a+x.price,0); const mySpent=spent(me.team); const next=room.bid?room.bid+(room.bid<100?5:room.bid<200?10:25):p?.[3]||0;
 useEffect(()=>setTime(room.timerSeconds),[room.index,room.timerSeconds]); useEffect(()=>{if(room.status!=='auction'||room.paused)return;const t=setInterval(()=>setTime(v=>{if(v<=1){clearInterval(t);resolveLot();return room.timerSeconds}return v-1}),1000);return()=>clearInterval(t)},[room.index,room.paused,room.timerSeconds]);
 const resolveLot=async()=>{if(!isHost)return;const {error}=await supabase.rpc('resolve_lot',{p_code:code,p_member_id:me.memberId});if(error)setNotice(error.message);else reload()};
 const bid=async()=>{const {error}=await supabase.rpc('place_bid',{p_code:code,p_team:me.team,p_member_id:me.memberId,p_amount:next});if(error)setNotice(error.message);else reload()};
 const control=async(pause=room.paused,timer=room.timerSeconds)=>{const {error}=await supabase.rpc('update_room_controls',{p_code:code,p_member_id:me.memberId,p_timer_seconds:timer,p_paused:pause});if(error)setNotice(error.message);else reload()};
 const endEarly=async()=>{const {error}=await supabase.rpc('end_auction_early',{p_code:code,p_member_id:me.memberId});if(error)setNotice(error.message);else reload()};
 const send=async()=>{const text=message.trim();if(!text)return;const {error}=await supabase.from('room_messages').insert({room_code:code,team:me.team,sender_name:me.name,message:text});if(error)setNotice(error.message);else{setMessage('');reload()}};
 if(room.status==='simulation')return <main className="shell"><div className="eyebrow">ROOM {code} · SIMULATION</div><h1>Auction <span>ended.</span></h1><div className="card"><p>The host ended the auction. Teams with fewer than 15 players were blocked from simulation.</p></div></main>;
 return <main className="shell arena"><header className="topbar"><div><div className="eyebrow">ROOM {code}</div><h2>IPL MEGA AUCTION</h2></div><div className={room.paused?'live paused':'live'}><i/> {room.paused?'PAUSED':'LIVE'} · LOT {room.index+1}/{PLAYERS.length}</div></header><div className="arena-grid"><div><div className="stage"><Stage color={COLORS[me.team]||'#ffc83d'} selectedTeam={me.team} player={p} bid={room.bid} bidder={room.bidder} members={members}/>{notice&&<div className="notice">{notice}</div>}</div><section className="card lot"><div className="lot-kicker">CURRENT LOT · {role[p?.[1]]}</div><h1>{p?.[0]||'Auction complete'}</h1><p>{p?.[2]} <span>·</span> Base price {money(p?.[3]||0)}</p><div className="current">{room.bid?money(room.bid):'NO BIDS'}</div><div className="leader">{room.bidder?<><b style={{color:COLORS[room.bidder]}}>{room.bidder}</b> leads the room</>:'Be the first to raise the paddle'}</div><div className={time<=5?'timer urgent':'timer'}>00:{String(time).padStart(2,'0')}</div><button className="primary bid" disabled={room.paused||room.bidder===me.team||next>12000-mySpent} onClick={bid}>{room.paused?'AUCTION PAUSED':room.bidder===me.team?'YOU LEAD':next>12000-mySpent?'PURSE LIMIT':`BID ${money(next)} ↑`}</button></section></div><aside><div className="card admin"><div className="card-title">{isHost?'HOST CONTROLS':'ROOM SETTINGS'}</div>{isHost?<><div className="setting"><span>Bid timer</span><div className="timer-options">{[5,10,15,20].map(s=><button key={s} className={room.timerSeconds===s?'active':''} onClick={()=>control(room.paused,s)}>{s}s</button>)}</div></div><button className="secondary full" onClick={()=>control(!room.paused)}>{room.paused?'Resume auction':'Pause auction'}</button><button className="link danger" onClick={endEarly}>End auction & simulate</button></>:<p className="muted">Only the host can change settings.</p>}</div><div className="card roster"><div className="card-title">TEAMS · ₹120 CR EACH</div>{members.map(m=>{const purchases=sold.filter(x=>x.team===m.team);return <details className="team-disclosure" key={m.team}><summary><i style={{background:COLORS[m.team]}}/><b>{m.team}</b><span>{purse(spent(m.team))} left</span></summary><div className="purchases">{purchases.length?purchases.map(x=><div className="purchase" key={x.id}><span>{x.player_name}</span><strong>{money(x.price)}</strong></div>):<em>No players bought yet</em>}</div></details>})}</div><div className="card chat"><div className="card-title">ROOM CHAT</div><div className="chat-log">{chat.map(x=><div className="chat-line" key={x.id}><b style={{color:COLORS[x.team]}}>{x.team}</b><span>{x.message}</span></div>)}</div><div className="chat-entry"><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Message room"/><button className="secondary" onClick={send}>Send</button></div></div></aside></div></main>;
}


class ArenaErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main className="shell"><div className="card"><h2>Auction room could not load</h2><p className="error">{this.state.error.message || 'Unexpected client error'}</p><a href="/">← Back home</a></div></main>;
    return this.props.children;
  }
}

export default function MultiplayerArenaWithBoundary(props) {
  return <ArenaErrorBoundary><MultiplayerArena {...props} /></ArenaErrorBoundary>;
}
