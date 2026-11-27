'use client';
import Arena from '../../../components/Arena';
export default function RoomPage({ params }) { return <Arena code={params.id.toUpperCase()} />; }
