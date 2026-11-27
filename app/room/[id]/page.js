'use client';
import MultiplayerArena from '../../../components/MultiplayerArena';
export default function RoomPage({ params }) { return <MultiplayerArena code={params.id.toUpperCase()} />; }
