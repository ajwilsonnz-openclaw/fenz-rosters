import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, ChevronDown, Check, Search, ShieldCheck } from 'lucide-react';
import { REGIONS } from '@/engine/ui-helpers';

interface SidebarProps {
  regionParam?: string;
  districtParam?: string;
  setRegionParam?: (v: string) => void;
  setDistrictParam?: (v: string) => void;
  updateUrlParams?: (r: string, d: string) => void;
  sidebarDistricts?: { id: string; name: string }[];
  selectedRanks?: string[];
  setSelectedRanks?: (r: string[]) => void;
  searchTerm?: string;
  setSearchTerm?: (s: string) => void;
  activePage?: string;
}

export default function Sidebar({
  regionParam = "Te Hiku",
  districtParam = "All",
  setRegionParam,
  setDistrictParam,
  updateUrlParams,
  sidebarDistricts = [],
  selectedRanks = [],
  setSelectedRanks,
  searchTerm = "",
  setSearchTerm,
  activePage
}: SidebarProps) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-64 bg-[#0B0B45] border-r border-blue-900/30 flex-shrink-0" />; 

  const navItems: { name: string; id: string; icon: any; route: string; exact?: boolean }[] = [
    { name: 'Create Vacancy', id: 'vacancy', icon: LayoutDashboard, route: '/vacancy' },
    { name: 'Available', id: 'available', icon: Users, route: '/available' },
    { name: 'Filled', id: 'filled', icon: UserCheck, route: '/filled' },
  ];

  return (
    <div className="w-64 bg-[#0B0B45] border-r border-blue-900/30 text-white flex-shrink-0 flex flex-col h-full overflow-y-auto">
      
      <div className="px-5 py-6 space-y-4">
        {/* Region Select */}
        <div>
          <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-2 block ml-1">Region</label>
          <div className="relative">
            <select
              value={regionParam}
              onChange={(e) => {
                const val = e.target.value;
                if (setRegionParam) setRegionParam(val);
                if (updateUrlParams) updateUrlParams(val, "All");
              }}
              className="w-full bg-[#1A1A5A] border border-blue-800/50 rounded-xl px-4 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-blue-400 transition-all text-white"
            >
              <option value="New Zealand">New Zealand</option>
              {REGIONS.filter(r => r !== 'New Zealand').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3 h-3 w-3 text-blue-400 pointer-events-none" />
          </div>
        </div>

        {/* District Select */}
        <div>
          <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-2 block ml-1">District</label>
          <div className="relative">
            <select
              value={districtParam}
              onChange={(e) => {
                const val = e.target.value;
                if (setDistrictParam) setDistrictParam(val);
                if (updateUrlParams) updateUrlParams(regionParam, val);
              }}
              className="w-full bg-[#1A1A5A] border border-blue-800/50 rounded-xl px-4 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-blue-400 transition-all text-white"
            >
              <option value="All">All Districts</option>
              {sidebarDistricts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3 h-3 w-3 text-blue-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 px-3 space-y-1">
        <label className="px-3 text-[11px] font-bold text-blue-300/50 tracking-wide mb-3 block">Navigation</label>
        {navItems.map((item) => {
          const isActive = activePage 
            ? activePage === item.id 
            : item.exact 
              ? path === item.route 
              : path.startsWith(item.route);

          return (
            <button
              key={item.id}
              onClick={() => {
                 // Keep the date & shift in the URL when navigating between pages
                 const currentQuery = searchParams ? searchParams.toString() : '';
                 router.push(`${item.route}${currentQuery ? `?${currentQuery}` : ''}`);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 border-l-4 ${
                isActive 
                  ? 'bg-[#1A1A5A] text-white border-blue-500 shadow-lg' 
                  : 'text-blue-300/70 border-transparent hover:text-white hover:bg-blue-800/30'
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-blue-500'}`} />
              {item.name}
            </button>
          );
        })}

        {/* FILTERS */}
        {setSelectedRanks && (
          <div className="mt-8 pt-8 border-t border-blue-900/30 px-2">
            <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-5 block">Filter</label>
            <div className="space-y-4">
              {[
                { id: 'Firefighters', label: 'Firefighters' },
                { id: 'Station Officers', label: 'Station Officers' },
                { id: 'Senior Station Officers', label: 'Senior Station Officers' }
              ].map(rank => {
                const isSelected = selectedRanks.includes(rank.id);
                return (
                  <label key={rank.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-[#1A1A5A] border-blue-800 group-hover:border-blue-700'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                    </div>
                    <span className={`text-[11px] font-black tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-blue-300/60 group-hover:text-blue-200'}`}>
                      {rank.label}
                    </span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedRanks(selectedRanks.filter(r => r !== rank.id));
                        } else {
                          setSelectedRanks([...selectedRanks, rank.id]);
                        }
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SEARCH AT BOTTOM */}
      {setSearchTerm && (
        <div className="p-4 border-t border-blue-900/30 bg-[#0A0A3D]">
          <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-3 block ml-1">Search</label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-blue-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1A5A] border border-blue-800/50 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold focus:outline-none focus:border-blue-400 text-white placeholder-blue-300/30 transition-all shadow-inner"
            />
          </div>
        </div>
      )}
    </div>
  );
}
