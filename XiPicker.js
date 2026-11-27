'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ROLE } from '@/lib/format';

export default function XiPicker({ s, match }) {
  const { squads, players, me, myXi } = s;
  const locked = myXi[match.id];
  const [xi, setXi] = useState(locked || []);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (locked && xi.length === 0) setXi(locked); }, [locked]);

  const squad = squads.filter((x) => x.user_id === me.id).map((x) => players[x.player_id]).filter(Boolean);
  const sel = xi.map((id) => players[id]).filter(Boolean);
  const os = sel.filter((p) => p.overseas).length;
  const wk = sel.filter((p) => p.role === 'WK').length;
  const bw = sel.filter((p) => ['PACE', 'SPIN', 'AR'].includes(p.role)).length;
  const ok = sel.length === 11 && os <= 4 && wk >= 1 && bw >= 5;
  const toggle = (id) => setXi((x) => (x.includes(id) ? x.filter((i) => i !== id) : x.length < 11 ? [...x, id] : x));
  const move = (i, d) => setXi((x) => { const y = [...x]; const j = i + d; if (j < 0 || j >= y.length) return y; [y[i], y[j]] = [y[j], y[i]]; return y; });
  const lock = async () => {
    setBusy(true); setErr('');
    const { error } = await supabase.rpc('submit_xi', { p_match: match.id, p_players: xi });
    setBusy(false);
    if (error) setErr(error.message); else s.reload();
  };
  const sorted = [...squad].sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
  const good = (c) => (c ? '#2fd27a' : '#ff5d5d');

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Your Playing XI ({sel.length}/11) {locked && <span className="tag">Locked ✓</span>}</h2>
      <div className="mute">
        <span style={{ color: good(os <= 4) }}>Overseas {os}/4</span> · <span style={{ color: good(wk >= 1) }}>Keeper {wk}</span> · <span style={{ color: good(bw >= 5) }}>Bowling options {bw}/5+</span>
      </div>
      <h2>Batting order</h2>
      {sel.length === 0 && <div className="mute">Tap players below to add them.</div>}
      {sel.map((p, i) => (
        <div className="row" key={p.id}>
          <span>{i + 1}. {p.name} <span className="mute">{ROLE[p.role]}{p.overseas ? ' ✈️' : ''}</span></span>
          <span>
            <button className="btn small alt" onClick={() => move(i, -1)}>↑</button>{' '}
            <button className="btn small alt" onClick={() => move(i, 1)}>↓</button>{' '}
            <button className="btn small alt" onClick={() => toggle(p.id)}>✕</button>
          </span>
        </div>
      ))}
      <h2>Squad</h2>
      {sorted.map((p) => (
        <div className="row" key={p.id} onClick={() => toggle(p.id)} style={{ opacity: xi.includes(p.id) ? 0.4 : 1 }}>
          <span>{p.name}</span><span className="mute">{ROLE[p.role]} · {p.country}</span>
        </div>
      ))}
      <button className="btn" disabled={!ok || busy} onClick={lock}>{locked ? 'Update XI' : 'Lock XI'}</button>
      {err && <div className="err">{err}</div>}
    </div>
  );
}
