'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRoom } from '@/hooks/useRoom';
import Lobby from '@/components/Lobby';
import Auction from '@/components/Auction';
import AuctionDone from '@/components/AuctionDone';
import Tournament from '@/components/Tournament';

export default function RoomPage() {
  const { id } = useParams();
  const s = useRoom(id);
  if (s.loading) return <div className="wrap mute">Loading…</div>;
  if (!s.room) return (
    <div className="wrap">
      <h2>Room not found</h2>
      <div className="mute">{s.error || 'You are not in this room.'}</div>
      <p><Link href="/">Back home</Link></p>
    </div>
  );
  const { status } = s.room;
  return (
    <div className="wrap">
      {status === 'lobby' && <Lobby s={s} />}
      {status === 'auction' && <Auction s={s} />}
      {status === 'xi' && <AuctionDone s={s} />}
      {(status === 'tournament' || status === 'done') && <Tournament s={s} />}
    </div>
  );
}
