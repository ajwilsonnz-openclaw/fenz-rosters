'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

const STATIONS = [
  { name: 'Albany', district: 'Waitemata', pos: [-2, 0, -4], color: '#3b82f6' },
  { name: 'Silverdale', district: 'Waitemata', pos: [-3, 0, -6], color: '#3b82f6' },
  { name: 'Devonport', district: 'Waitemata', pos: [-0.5, 0, -1.5], color: '#3b82f6' },
  { name: 'Warkworth', district: 'Waitemata', pos: [-4, 0, -9], color: '#3b82f6' },
  
  { name: 'Auckland City', district: 'Auckland', pos: [0, 0, 0], color: '#10b981' },
  { name: 'Avondale', district: 'Auckland', pos: [-2.5, 0, 1], color: '#10b981' },
  { name: 'Te Atatu', district: 'Auckland', pos: [-3.5, 0, -0.5], color: '#10b981' },
  { name: 'Parnell', district: 'Auckland', pos: [1, 0, 0.5], color: '#10b981' },
  
  { name: 'Manurewa', district: 'Counties Manukau', pos: [3, 0, 5], color: '#f97316' },
  { name: 'Howick', district: 'Counties Manukau', pos: [4, 0, 2], color: '#f97316' },
  { name: 'Otara', district: 'Counties Manukau', pos: [2.5, 0, 3.5], color: '#f97316' },
  { name: 'Papakura', district: 'Counties Manukau', pos: [4, 0, 7], color: '#f97316' },
];

function FlowParticles({ wave, play }: { wave: number; play: boolean }) {
  const points = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (!play || !points.current) return;
    const time = state.clock.getElapsedTime();
    // Placeholder for animated particle logic
    points.current.rotation.y = time * 0.1;
  });

  return (
    <points ref={points}>
      <bufferGeometry />
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.6} />
    </points>
  );
}

function MapScene({ wave, play }: { wave: number; play: boolean }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <gridHelper args={[30, 30, '#ffffff', '#222222']} position={[0, -0.5, 0]} />

      {STATIONS.map((st, i) => (
        <group key={i} position={new THREE.Vector3(...st.pos)}>
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={st.color} emissive={st.color} emissiveIntensity={0.8} />
          </mesh>
          <Html distanceFactor={15} position={[0, 0.5, 0]} center zIndexRange={[100, 0]}>
            <div className="text-xs text-white font-bold whitespace-nowrap bg-black/70 px-2 py-0.5 rounded border border-white/20 backdrop-blur-sm transition-all hover:scale-110 cursor-pointer">
              {st.name}
            </div>
          </Html>
        </group>
      ))}

      <FlowParticles wave={wave} play={play} />
      
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </>
  );
}

export default function ThreeJsVisualizer() {
  const [wave, setWave] = useState(1);
  const [play, setPlay] = useState(true);

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 p-6 z-10 text-white w-full pointer-events-none flex justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-orange-500">
            FENZ Engine Visualizer
          </h1>
          <p className="text-gray-400 mt-2 max-w-lg text-sm leading-relaxed">
            Real-time visualization of the multi-district OT allocation engine.
          </p>

          <div className="mt-6 flex gap-4 pointer-events-auto">
            <button 
              onClick={() => setPlay(!play)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-600 transition-all font-semibold shadow-lg active:scale-95 flex items-center gap-2"
            >
              {play ? (
                <><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Pause</>
              ) : (
                <><span className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-green-500 border-b-[6px] border-b-transparent ml-1"></span> Play Flow</>
              )}
            </button>
            
            <div className="flex bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-600 p-1 shadow-lg">
              {[1, 2, 3].map(w => (
                <button
                  key={w}
                  onClick={() => setWave(w)}
                  className={`px-5 py-1.5 rounded-full transition-all text-sm font-medium ${
                    wave === w 
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Wave {w}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-3 bg-black/60 p-5 rounded-2xl border border-white/10 w-fit backdrop-blur-xl shadow-2xl">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Districts & Status</h3>
            <div className="flex items-center gap-3 text-sm font-medium"><div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]"></div> Waitemata</div>
            <div className="flex items-center gap-3 text-sm font-medium"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"></div> Auckland</div>
            <div className="flex items-center gap-3 text-sm font-medium"><div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_12px_#f97316]"></div> Counties Manukau</div>
            
            <div className="h-px bg-white/10 my-4"></div>
            
            <div className="text-sm font-medium text-blue-200">
              {wave === 1 && "▶ Wave 1: Internal District (Callback/Non-CB)"}
              {wave === 2 && "▶ Wave 2: Out-Of-District Cross-Flow"}
              {wave === 3 && "▶ Wave 3: Officers & Ride-Up/Down"}
            </div>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 12, 15], fov: 45 }}>
        <MapScene wave={wave} play={play} />
      </Canvas>
    </div>
  );
}
