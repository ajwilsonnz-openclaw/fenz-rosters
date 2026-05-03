'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Vacancy Management" }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 bg-[#0A0A3D] border-b border-blue-900/30 flex items-center justify-between shrink-0">
      <div className="h-full flex items-center">
        {/* LOGO SECTION - Hits top and bottom */}
        <div className="h-full px-6 flex items-center gap-4 bg-[#0B0B45]">
          <div className="h-20 w-20 flex-shrink-0">
            <img src="/fenz-logo.svg" alt="FENZ Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black italic leading-none tracking-tighter text-white uppercase">Rosters</h1>
          </div>
        </div>

        <div className="h-8 w-px bg-blue-900/30 mx-2" />
        
        <h2 className="px-6 text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h2>
      </div>

      <div className="flex items-center gap-6 px-8">
        {/* CLOCK */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-950/50 rounded-full border border-blue-800/30 min-w-[200px] justify-center">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest tabular-nums">
            {!mounted ? '-- --- ---- --:--:--' : (
              <>
                {time.toLocaleDateString('en-NZ', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} {time.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </>
            )}
          </span>
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Station Officer</span>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Shift Supervisor</span>
          </div>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center border-2 border-blue-400/30 shadow-lg shadow-blue-900/20">
            <span className="text-xs font-black text-white">ST</span>
          </div>
        </div>
      </div>
    </header>
  );
}
