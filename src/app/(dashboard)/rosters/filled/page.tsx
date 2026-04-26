'use client';

import { useState, useEffect, Suspense } from 'react';
import { getOperationalTime } from '@/engine/ui-helpers';
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";
import { supabase } from '@/lib/supabase';

function FilledContent() {
  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);
  const [stations, setStations] = useState<any[]>([]);
  const [allDistricts, setAllDistricts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRegion = sessionStorage.getItem('fenz_region');
    const savedDistrict = sessionStorage.getItem('fenz_district');
    const savedRanks = sessionStorage.getItem('fenz_ranks');
    
    if (savedRegion) setRegionParam(savedRegion);
    if (savedDistrict) setDistrictParam(savedDistrict);
    if (savedRanks) setSelectedRanks(JSON.parse(savedRanks));
  }, []);

  const [opTime, setOpTime] = useState(() => getOperationalTime(new Date()));
  const { date: operativeDate, shift: operativeShift } = opTime;

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_region', regionParam);
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [regionParam, selectedRanks, mounted]);

  useEffect(() => {
    async function loadInitialData() {
      const { data: areaData } = await supabase.from('areas').select('*');
      if (areaData) setAllDistricts(areaData);
      const { data: stationData } = await supabase.from('stations').select('*');
      if (stationData) setStations(stationData);
    }
    loadInitialData();
  }, []);

  const updateUrlParams = (region: string, district: string) => {
    setRegionParam(region);
    setDistrictParam(district);
    sessionStorage.setItem('fenz_district', district);
  };

  const sidebarDistricts = (regionParam === "New Zealand" 
    ? allDistricts 
    : allDistricts.filter(d => {
        // This is a simplified version of the region mapping logic
        return true; 
      }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex h-full w-full bg-[#0B0B45] overflow-hidden text-white font-sans selection:bg-blue-500/30">
      <Sidebar 
        regionParam={regionParam}
        districtParam={districtParam}
        updateUrlParams={updateUrlParams}
        sidebarDistricts={sidebarDistricts}
        selectedRanks={selectedRanks}
        setSelectedRanks={setSelectedRanks}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* TOP HEADER */}
        <Header title="FILLED SHIFTS" />

        <DateToolbar 
          operativeDate={operativeDate}
          operativeShift={operativeShift}
          setOpTime={setOpTime}
        />

        <main className="flex-1 p-8 overflow-hidden bg-[#f3f7fa]">
           <div className="h-full w-full border-2 border-dashed border-gray-200 rounded-[40px] flex items-center justify-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Filled Positions View (Blank Prototype)</p>
           </div>
        </main>
      </div>
    </div>
  );
}

export default function FilledPage() {
  return (
    <Suspense fallback={<div>Loading Roster State...</div>}>
      <FilledContent />
    </Suspense>
  );
}
