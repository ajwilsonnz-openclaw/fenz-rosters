import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, Shield, ChevronDown, Check, Search } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a skeleton until mounted
  if (!mounted) return <div className="w-64 bg-[#0B0F19] border-r border-slate-800 flex-shrink-0" />; 

  const navItems = [
    { name: 'Vacancy Management', id: 'officer', icon: LayoutDashboard, route: '/officer' },
    { name: 'Available Candidates', id: 'rosters', icon: Users, route: '/rosters' },
    { name: 'Filled Shifts', id: 'filled', icon: UserCheck, route: '/rosters/filled' },
  ];

  return (
    <div className="w-64 bg-[#0B0F19] border-r border-slate-800 text-white flex-shrink-0 flex flex-col h-screen overflow-y-auto">
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
          FIRE ROSTERS
        </h1>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Region Select */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Region</label>
          <div className="relative">
            <select
              value={regionParam}
              onChange={(e) => {
                const val = e.target.value;
                if (setRegionParam) setRegionParam(val);
                if (updateUrlParams) updateUrlParams(val, "All");
              }}
              className="w-full bg-[#131B2C] border border-slate-800 rounded-lg px-3 py-2 text-sm font-medium appearance-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            >
              <option value="New Zealand">New Zealand</option>
              {REGIONS.filter(r => r !== 'New Zealand').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* District Select */}
        {regionParam !== "New Zealand" && sidebarDistricts.length > 0 && (
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">District</label>
            <div className="relative">
              <select
                value={districtParam}
                onChange={(e) => {
                  const val = e.target.value;
                  if (setDistrictParam) setDistrictParam(val);
                  if (updateUrlParams) updateUrlParams(regionParam, val);
                }}
                className="w-full bg-[#131B2C] border border-slate-800 rounded-lg px-3 py-2 text-sm font-medium appearance-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
              >
                <option value="All">All Districts</option>
                {sidebarDistricts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-4 space-y-1">
        <label className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Navigation</label>
        {navItems.map((item) => {
          const isActive = activePage ? activePage === item.id : path.includes(item.route);
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-red-500/10 to-transparent text-red-400 border-l-2 border-red-500' 
                  : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          );
        })}
      </div>

      {(setSelectedRanks || setSearchTerm) && (
        <div className="p-4 border-t border-slate-800 mt-4 flex-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Filters</label>
          
          {setSearchTerm && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search firefighter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#131B2C] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 text-white placeholder-slate-600 transition-all"
              />
            </div>
          )}

          {setSelectedRanks && (
            <div className="space-y-3.5">
              {[
                { id: 'Firefighters', label: 'Firefighters' },
                { id: 'Station Officers', label: 'Station Officers' },
                { id: 'Senior Station Officers', label: 'Senior Station Officers' }
              ].map(rank => {
                const isSelected = selectedRanks.includes(rank.id);
                return (
                  <label key={rank.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                        : 'bg-[#131B2C] border-slate-700 group-hover:border-slate-500'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-slate-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
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
          )}
        </div>
      )}
    </div>
  );
}
