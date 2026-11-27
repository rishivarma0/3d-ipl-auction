'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const PODIUMS = [
  { team: 'MI', color: '#004BA0', x: -3.9 },
  { team: 'CSK', color: '#FFF200', x: -2.1 },
  { team: 'RCB', color: '#EC1C24', x: 2.1 },
  { team: 'KKR', color: '#6B35A8', x: 3.9 },
];

function FloatingPlayer({ player, bid, bidder, color }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = 1.35 + Math.sin(clock.elapsedTime * 1.8) * 0.08;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.12;
  });
  return <group ref={group} position={[0, 1.35, -1.25]} rotation={[0, -0.12, 0]}>
    <mesh castShadow><boxGeometry args={[1.65, 2.25, 0.08]} /><meshStandardMaterial color="#f7f8ff" roughness={0.42} /></mesh>
    <mesh position={[0, 0.55, 0.055]}><boxGeometry args={[1.35, 0.1, 0.02]} /><meshBasicMaterial color={color} /></mesh>
    <mesh position={[0, 0.08, 0.055]}><circleGeometry args={[0.28, 24]} /><meshBasicMaterial color={color} /></mesh>
    <mesh position={[0, -0.45, 0.055]}><boxGeometry args={[1.1, 0.06, 0.02]} /><meshBasicMaterial color="#263762" /></mesh>
    <mesh position={[0, -0.62, 0.055]}><boxGeometry args={[0.8, 0.045, 0.02]} /><meshBasicMaterial color="#9aa5c7" /></mesh>
    <pointLight position={[0, 0, 0.5]} intensity={bid ? 3 : 1} distance={2} color={color} />
  </group>;
}

function Podium({ team, color, x, active }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = active ? Math.sin(clock.elapsedTime * 3) * 0.025 : 0;
  });
  return <group ref={group} position={[x, 0, 1.25]}>
    <mesh castShadow><cylinderGeometry args={[0.63, 0.84, 0.72, 8]} /><meshStandardMaterial color={color} metalness={0.35} roughness={0.4} /></mesh>
    <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.34, 0.34, 0.07, 24]} /><meshStandardMaterial color={active ? '#fff' : '#152247'} emissive={active ? color : '#000'} emissiveIntensity={active ? 1.4 : 0} /></mesh>
    <mesh position={[0, 0.83, -0.02]} rotation={[-0.22, 0, 0]}><planeGeometry args={[0.72, 0.4]} /><meshBasicMaterial color={active ? '#fff' : color} /></mesh>
  </group>;
}

function RoomSet({ color, player, bid, bidder, members = [] }) {
  return <>
    <ambientLight intensity={0.72} />
    <spotLight position={[0, 6, -2]} intensity={60} angle={0.48} penumbra={0.65} distance={18} castShadow color="#fff8df" />
    <pointLight position={[0, 2, 3]} intensity={18} distance={9} color={color} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow><circleGeometry args={[5.2, 48]} /><meshStandardMaterial color="#101c3d" roughness={0.82} /></mesh>
    <mesh position={[0, -0.35, -1.1]} castShadow><boxGeometry args={[6.9, 0.55, 2.15]} /><meshStandardMaterial color="#2c3e50" metalness={0.28} roughness={0.7} /></mesh>
    <mesh position={[0, -0.02, -1.1]}><boxGeometry args={[6.65, 0.04, 1.95]} /><meshStandardMaterial color="#1b2d58" /></mesh>
    <mesh position={[0, 0.22, 0.7]}><boxGeometry args={[0.12, 1.1, 0.12]} /><meshStandardMaterial color="#7383ad" /></mesh>
    <mesh position={[0, 0.75, 0.7]}><boxGeometry args={[1.1, 0.08, 0.08]} /><meshStandardMaterial color="#7383ad" /></mesh>
    <FloatingPlayer player={player} bid={bid} bidder={bidder} color={color} />
    {PODIUMS.map(p => <Podium key={p.team} {...p} active={bidder === p.team || members.some(m => m.team === p.team && m.user_id === bidder)} />)}
  </>;
}

export default function Stage({ color = '#ffc83d', player, bid, bidder, members }) {
  return <Canvas shadows camera={{ position: [0, 1.5, 5.2], fov: 45 }} gl={{ antialias: true, powerPreference: 'low-power' }}>
    <color attach="background" args={['#0b1020']} />
    <RoomSet color={color} player={player} bid={bid} bidder={bidder} members={members} />
  </Canvas>;
}
