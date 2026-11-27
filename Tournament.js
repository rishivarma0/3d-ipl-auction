'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fixResult } from '@/lib/format';
import { TEAMS } from '@/lib/teams';
import XiPicker from './XiPicker';

export default function Tournament({ s }) {
  const { room, members, matches, standings, me } = s;
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const team = (uid) => members.find((m) => m.user_id === uid)?.team || '?';
  const pending = matches.filter((m) => m.status === 'pending');
  const round = pending.length ? Math.min(...pending.map((m) => m.round)) : null;
  const myMatch = pending.find((m) => m.round === round && (m.team_a === me.id || m.team_b === me.id));
  const final = matches.find((m) => m.stage === 'final');
  const rounds = [...new Set(matches.map((m) => m.round))];
  const isHost = room.host === me.id;

  const play = async () => {
    setBusy(true); setErr('');
    const { error } = await supabase.rpc('run_round', { p_room: room.id });
    setBusy(false);
    if (error) setErr(error.message); else s.reload();
  };

  const line = (m) => {
    if (m.status !== 'done') return <span className="mute">upcoming</span>;
    return (
      <span>
        {m.runs_a}/{m.wkts_a} – {m.runs_b}/{m.wkts_b}<br />
        <span className="mute">{team(m.winner)} won {fixResult(m.result)}</span>
      </span>
    );
  };

  return (
    <>
      <h1>🏆 Tournament</h1>
      {room.status === 'done' && final?.winner && (
        <div className="champ">Champions: {TEAMS[team(final.winner)]?.name}<br />🏆</div>
      )}
      <h2>Points table</h2>
      <div className="panel">
        <table>
          <thead><tr><th>Team</th><th>P</th><th>W</th><th>Pts</th><th>+/-</th></tr></thead>
          <tbody>
            {standings.map((r) => (
              <tr key={r.user_id}><td><span className="dot" style={{ background: TEAMS[r.team].color }} />{r.team}</td><td>{r.played}</td><td>{r.won}</td><td>{r.pts}</td><td>{r.diff}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {room.status === 'tournament' && round != null && (
        <>
          <h2>{matches.find((m) => m.round === round)?.stage === 'final' ? 'Final' : `Round ${round}`}</h2>
          {myMatch ? (
            <>
              <div className="panel">Your match: <b>{team(myMatch.team_a)}</b> vs <b>{team(myMatch.team_b)}</b></div>
              <XiPicker s={s} match={myMatch} />
            </>
          ) : (
            <div className="panel mute">You are resting this round.</div>
          )}
          <button className="btn" disabled={busy} onClick={play}>
            {isHost ? 'Simulate this round' : 'Play round (when everyone is locked)'}
          </button>
          <div className="mute">The host can simulate at any time; teams that have not locked an XI get an auto-picked one.</div>
          {err && <div className="err">{err}</div>}
        </>
      )}

      <h2>Fixtures & results</h2>
      {rounds.map((r) => (
        <div className="panel" key={r}>
          <div className="mute">{matches.find((m) => m.round === r)?.stage === 'final' ? 'Final' : `Round ${r}`}</div>
          {matches.filter((m) => m.round === r).map((m) => (
            <div className="row" key={m.id}><b>{team(m.team_a)} v {team(m.team_b)}</b>{line(m)}</div>
          ))}
        </div>
      ))}
    </>
  );
}
