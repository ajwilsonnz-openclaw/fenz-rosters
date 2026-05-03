'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);
  const [sidebarDistricts, setSidebarDistricts] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    // 1. Load saved preferences from session
    const savedRegion = sessionStorage.getItem('fenz_region');
    const savedDistrict = sessionStorage.getItem('fenz_district');
    const savedRanks = sessionStorage.getItem('fenz_ranks');

    if (savedRegion) setRegionParam(savedRegion);
    if (savedDistrict) setDistrictParam(savedDistrict);
    if (savedRanks) setSelectedRanks(JSON.parse(savedRanks));

    // 2. Fetch unique districts for the Sidebar dropdown
    async function loadDistricts() {
      const { data } = await supabase.from('stations').select('district');
      if (data) {
        const unique = Array.from(new Set(data.map(s => s.district)))
          .filter(Boolean)
          .map(d => ({ id: d as string, name: d as string }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setSidebarDistricts(unique);
      }
    }
    loadDistricts();
  }, []);

  const updateUrlParams = (region: string, district: string) => {
    setRegionParam(region);
    setDistrictParam(district);
    sessionStorage.setItem('fenz_region', region);
    sessionStorage.setItem('fenz_district', district);
    
    // Update the URL so the Current Page can react to the change
    const params = new URLSearchParams(searchParams.toString());
    params.set('district', district);
    params.set('region', region);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRankChange = (ranks: string[]) => {
    setSelectedRanks(ranks);
    sessionStorage.setItem('fenz_ranks', JSON.stringify(ranks));
    
    // Trigger a URL update so pages know to filter ranks
    const params = new URLSearchParams(searchParams.toString());
    params.set('ranks', JSON.stringify(ranks));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Sidebar 
      regionParam={regionParam} 
      districtParam={districtParam} 
      updateUrlParams={updateUrlParams} 
      sidebarDistricts={sidebarDistricts}
      selectedRanks={selectedRanks}
      setSelectedRanks={handleRankChange}
    />
  );
}