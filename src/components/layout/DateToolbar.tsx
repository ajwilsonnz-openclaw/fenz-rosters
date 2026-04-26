"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Sun, Moon, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOnDutyWatch, findWatchOccurrence } from '@/engine/watch-math';
import { getOperationalTime } from '@/engine/ui-helpers';
import { getWatchColor, getCalendarDays } from '@/engine/ui-helpers';

interface DateToolbarProps {
  operativeDate: Date;
  operativeShift: 'Day' | 'Night';
  setOpTime: (opTime: { date: Date; shift: 'Day' | 'Night' }) => void;
}

export default function DateToolbar({ 
  operativeDate, 
  operativeShift, 
  setOpTime 
}: DateToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(operativeDate);

  const handleSetOpTime = (newOpTime: { date: Date; shift: 'Day' | 'Night' }) => {
    const dateStr = newOpTime.date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    sessionStorage.setItem('fenz_op_date', newOpTime.date.toISOString());
    sessionStorage.setItem('fenz_op_shift', newOpTime.shift);
    
    // Update URL to help persistence across direct navigation
    const params = new URLSearchParams(searchParams);
    params.set('date', dateStr);
    params.set('shift', newOpTime.shift);
    router.replace(`${pathname}?${params.toString()}`);
    
    setOpTime(newOpTime);
  };

  // Sync from URL or SessionStorage on load if not already set
  useEffect(() => {
    const urlDate = searchParams.get('date');
    const urlShift = searchParams.get('shift');
    
    if (urlDate && urlShift) {
      const d = new Date(urlDate);
      if (d.toDateString() !== operativeDate.toDateString() || urlShift !== operativeShift) {
        setOpTime({ date: d, shift: urlShift as any });
      }
    } else {
      const savedDate = sessionStorage.getItem('fenz_op_date');
      const savedShift = sessionStorage.getItem('fenz_op_shift');
      if (savedDate && savedShift) {
        setOpTime({ date: new Date(savedDate), shift: savedShift as any });
      }
    }
  }, []);

  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);

  const prevShiftDate = new Date(operativeDate.getTime());
  let prevShiftType: 'Day' | 'Night' = 'Night';
  if (operativeShift === 'Night') prevShiftType = 'Day'; else prevShiftDate.setUTCDate(prevShiftDate.getUTCDate() - 1);
  const prevShiftWatch = getOnDutyWatch(prevShiftDate, prevShiftType);

  const nextShiftDate = new Date(operativeDate.getTime());
  let nextShiftType: 'Day' | 'Night' = 'Day';
  if (operativeShift === 'Day') nextShiftType = 'Night'; else nextShiftDate.setUTCDate(nextShiftDate.getUTCDate() + 1);
  const nextShiftWatch = getOnDutyWatch(nextShiftDate, nextShiftType);

  const calendarDays = getCalendarDays(calendarViewDate, operativeShift);

  return (
    <div className="px-8 py-3 bg-[#e0f2fe] border-b border-blue-200 flex items-center justify-between shrink-0 relative">
      <div className="flex items-center gap-6">
        <span className="text-[11px] font-bold text-blue-900/60 uppercase tracking-wider">Select date</span>
        
        <div className="flex items-center gap-1">
          {/* PREV CURRENT WATCH */}
          <button 
            onClick={() => { const occ = findWatchOccurrence(onDutyWatch, operativeDate, 'prev'); if (occ) handleSetOpTime(occ); }}
            className="flex flex-col items-center justify-center h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-20"
            style={{ backgroundColor: getWatchColor(onDutyWatch) }}
          >
            <span className="text-[8px] font-black leading-none mb-1 uppercase">PREV</span>
            <span className="text-[10px] font-black leading-none uppercase">{onDutyWatch}</span>
          </button>

          {/* PREV SHIFT */}
          <button 
            onClick={() => handleSetOpTime({ date: prevShiftDate, shift: prevShiftType })}
            className="flex items-center justify-center gap-1.5 h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-16"
            style={{ backgroundColor: getWatchColor(prevShiftWatch) }}
          >
            {prevShiftType === 'Day' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-black uppercase">{prevShiftDate.getUTCDate().toString().padStart(2, '0')}</span>
          </button>

          {/* CURRENT SHIFT BUTTON */}
          <div className="flex items-center gap-2 h-10 px-6 rounded text-white shadow-md border-2 min-w-[150px] justify-center"
               style={{ backgroundColor: getWatchColor(onDutyWatch), borderColor: `${getWatchColor(onDutyWatch)}90` }}>
            {operativeShift === 'Day' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-[11px] font-black uppercase whitespace-nowrap">
              {operativeDate.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()} {operativeDate.getUTCDate().toString().padStart(2, '0')} {operativeDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
            </span>
          </div>

          {/* NEXT SHIFT */}
          <button 
            onClick={() => handleSetOpTime({ date: nextShiftDate, shift: nextShiftType })}
            className="flex items-center justify-center gap-1.5 h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-16"
            style={{ backgroundColor: getWatchColor(nextShiftWatch) }}
          >
            {nextShiftType === 'Day' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-black uppercase">{nextShiftDate.getUTCDate().toString().padStart(2, '0')}</span>
          </button>

          {/* NEXT CURRENT WATCH */}
          <button 
            onClick={() => { const occ = findWatchOccurrence(onDutyWatch, operativeDate, 'next'); if (occ) handleSetOpTime(occ); }}
            className="flex flex-col items-center justify-center h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-20"
            style={{ backgroundColor: getWatchColor(onDutyWatch) }}
          >
            <span className="text-[8px] font-black leading-none mb-1 uppercase">NEXT</span>
            <span className="text-[10px] font-black leading-none uppercase">{onDutyWatch}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button 
            onClick={() => handleSetOpTime(getOperationalTime(new Date()))}
            className="px-5 h-10 bg-[#0284c7] text-white text-[11px] font-black uppercase rounded shadow-sm hover:bg-blue-600 transition-all"
          >
            Today
          </button>
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-10 h-10 bg-[#0284c7] text-white rounded shadow-sm hover:bg-blue-600 transition-all flex items-center justify-center"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CURRENT DATE STATUS ON FAR RIGHT */}
      <div className="flex items-center gap-3 pr-4 border-l border-blue-300/30 pl-6">
        <span className="text-[10px] font-black text-blue-800/50 uppercase tracking-tighter">Current:</span>
        <span className="text-[11px] font-black text-blue-900 whitespace-nowrap">{operativeDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        {operativeShift === 'Day' ? <Sun className="w-3.5 h-3.5 text-orange-500" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
      </div>

      {/* CALENDAR PICKER OVERLAY */}
      {isCalendarOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsCalendarOpen(false)} />
          <div className="absolute top-full left-[620px] -translate-x-1/2 mt-3 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-[70] w-[340px]">
            <div className="flex items-center justify-between mb-6 px-1">
               <button onClick={() => { const d = new Date(calendarViewDate); d.setMonth(d.getMonth()-1); setCalendarViewDate(d); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
               <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">{calendarViewDate.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })}</span>
               <button onClick={() => { const d = new Date(calendarViewDate); d.setMonth(d.getMonth()+1); setCalendarViewDate(d); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-4">
              {['S','M','T','W','T','F','S'].map((d, idx) => <div key={`${d}-${idx}`} className="font-black text-gray-300">{d}</div>)}
              {calendarDays.map((day, i) => (
                <div key={i} className="flex items-center justify-center">
                  {day ? (
                    <button 
                      onClick={() => { handleSetOpTime({ date: day.date, shift: operativeShift }); setIsCalendarOpen(false); }} 
                      className={`w-9 h-9 flex items-center justify-center font-black rounded-xl transition-all relative ${day.date.toDateString() === operativeDate.toDateString() ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {day.day}
                      <div className="absolute bottom-1 w-4 h-1 rounded-full" style={{ backgroundColor: day.color }} />
                    </button>
                  ) : <div className="w-9 h-9" />}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center mb-2">
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button 
                  onClick={() => handleSetOpTime({ date: operativeDate, shift: 'Day' })}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${operativeShift === 'Day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Sun className="w-3 h-3" /> Day
                </button>
                <button 
                  onClick={() => handleSetOpTime({ date: operativeDate, shift: 'Night' })}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${operativeShift === 'Night' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Moon className="w-3 h-3" /> Night
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
