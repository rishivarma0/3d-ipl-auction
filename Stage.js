'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const ROLE_COLOR = { BAT: '#3b82f6', WK: '#a855f7', AR: '#22c55e', PACE: '#ef4444', SPIN: '#f59e0b' };

function Slab({ color }) {
  const g = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) { g.current.position.y = 1.5 + Math.sin(t * 1.6) * 0.1; g.current.rotation.y = t * 0.8; }
  });
  return (
    <group ref={g}>
      <mesh><boxGeometry args={[1.5, 2, 0.14]} /><meshStandardMaterial color={color} metalness={0.4} roughness={0.35} /></mesh>
      <mesh position={[0, 0, 0.09]}><boxGeometry args={[1.2, 1.7, 0.02]} /><meshStandardMaterial color="#0b1020" /></mesh>
      <mesh position={[0, 0.5, 0.11]}><circleGeometry args={[0.35, 24]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}

function Paddle({ x, color, up }) {
  const g = useRef();
  useFrame((_, dt) => {
    if (g.current) g.current.position.y += ((up ? 0.9 : -0.35) - g.current.position.y) * Math.min(1, dt * 8);
  });
  return (
    <group ref={g} position={[x, -0.35, 2.4]}>
      <mesh position={[0, -0.35, 0]}><cylinderGeometry args={[0.04, 0.04, 0.7, 8]} /><meshStandardMaterial color="#d6d6d6" /></mesh>
      <mesh><boxGeometry args={[0.62, 0.46, 0.05]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}

export default function Stage({ role, members, leaderId, colors }) {
  const n = members.length;
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 2.2, 6.2], fov: 48 }} gl={{ antialias: true, powerPreference: 'low-power' }}>
      <color attach="background" args={['#0b1020']} />
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 7, 4]} intensity={90} angle={0.55} penumbra={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}><circleGeometry args={[7, 40]} /><meshStandardMaterial color="#10285c" /></mesh>
      <mesh position={[0, -0.6, 0]}><cylinderGeometry args={[1.3, 1.5, 0.7, 24]} /><meshStandardMaterial color="#1c3b7a" /></mesh>
      <Slab color={ROLE_COLOR[role] || '#888'} />
      {members.map((m, i) => (
        <Paddle key={m.user_id} x={(i - (n - 1) / 2) * 0.85} color={colors[m.team]} up={leaderId === m.user_id} />
      ))}
    </Canvas>
  );
}
