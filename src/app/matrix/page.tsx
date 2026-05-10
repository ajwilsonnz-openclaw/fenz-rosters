'use client';

import * as React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { AvailabilityView } from '@/components/pwa/AvailabilityView';
import { ProfileView } from '@/components/pwa/ProfileView';
import { OffersView } from '@/components/pwa/OffersView';
import { ConfirmedView } from '@/components/pwa/ConfirmedView';

import BottomNav from '@/components/layout/BottomNav';

const TEST_USERS = [
  "wiremu.hemara@fireandemergency.nz",
  "sarah.mitchell@fireandemergency.nz",
  "tane.rawiri@fireandemergency.nz",
  "liam.obrien@fireandemergency.nz",
  "aroha.te rangi@fireandemergency.nz",
  "marcus.williams@fireandemergency.nz",
  "kahu.makiha@fireandemergency.nz",
  "rebecca.taylor@fireandemergency.nz",
  "luke.tanner@fireandemergency.nz",
  "tommy.ahu@fireandemergency.nz",
  "fiona.cameron@fireandemergency.nz",
  "sam.tong@fireandemergency.nz"
];

function MobileFrame({ email }: { email: string }) {
  const [currentTab, setCurrentTab] = React.useState('/mobile/availability');

  const renderContent = () => {
    switch (currentTab) {
      case '/mobile/profile':
        return <ProfileView testEmail={email} />;
      case '/mobile/offers':
        return <OffersView testEmail={email} />;
      case '/mobile/confirmed':
        return <ConfirmedView testEmail={email} />;
      case '/mobile/availability':
      default:
        return <AvailabilityView testEmail={email} isMatrix={true} />;
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case '/mobile/profile': return 'PROFILE';
      case '/mobile/offers': return 'OFFERS';
      case '/mobile/confirmed': return 'ROSTER';
      case '/mobile/availability':
      default: return 'AVAILABILITY';
    }
  };

  return (
    <div className="w-[414px] h-[900px] bg-slate-50 border-[8px] border-slate-900 rounded-[3rem] shadow-xl overflow-hidden flex flex-col relative scale-[0.95] origin-top">
      {/* Header */}
      <header className="w-full bg-[#005DAC] text-white shadow-md sticky top-0 z-50 h-14 shrink-0">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex-1 flex items-center justify-start">
            <Image src="/fenz-logo.svg" alt="FENZ Logo" width={171} height={40} className="w-[100px] h-auto" priority />
          </div>
          <div className="flex-[2] flex justify-center">
            <span className="font-black uppercase tracking-widest text-[13px]">{getTitle()}</span>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/10" title={email}>
              <User className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: 'none' }}>
        {renderContent()}
      </main>
      
      <BottomNav className="absolute bottom-0 w-full" currentTab={currentTab} onNavigate={setCurrentTab} testEmail={email} />

      {/* Footer Tag is removed, label moved to grid wrapper */}
    </div>
  );
}

export default function MatrixDemoPage() {
  const [ffs, setFfs] = React.useState<{ email: string, name: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
      import('@/lib/supabase').then(({ supabase }) => {
          supabase.from('firefighters').select('email, first_name, last_name').eq('is_active', true).then(({ data }) => {
              if (data && data.length > 0) {
                  setFfs(data.map(ff => ({ email: ff.email, name: `${ff.first_name} ${ff.last_name}` })));
                  
                  const saved = localStorage.getItem('matrix_selected_users');
                  if (saved) {
                      setSelectedUsers(JSON.parse(saved));
                  } else {
                      // Fallback to first 12 DB users if no saved state
                      const defaultUsers = data.slice(0, 12).map(f => f.email);
                      setSelectedUsers(defaultUsers);
                      localStorage.setItem('matrix_selected_users', JSON.stringify(defaultUsers));
                  }
              }
              setIsLoaded(true);
          });
      });
  }, []);

  const handleUserChange = (index: number, newEmail: string) => {
      const updated = [...selectedUsers];
      updated[index] = newEmail;
      setSelectedUsers(updated);
      localStorage.setItem('matrix_selected_users', JSON.stringify(updated));
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-200 p-8 flex items-center justify-center font-black uppercase text-slate-500">Loading DB...</div>;

  return (
    <div className="min-h-screen bg-slate-200 p-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6 flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-300">
          <div>
            <h1 className="text-3xl font-black text-[#005DAC] uppercase tracking-tight">Multi-User Matrix View</h1>
            <p className="text-slate-600 font-medium mt-1">Live simultaneous preview of 12 distinct FENZ firefighter availability dashboards for demoing algorithm outcomes.</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Prototype Testing</p>
          </div>
        </div>

        {/* Flex grid to hold the devices tightly */}
        <div className="flex flex-wrap gap-x-6 gap-y-24 justify-center pt-12">
          {selectedUsers.map((email, i) => (
            <div key={`${email}-${i}`} className="h-[880px] relative flex flex-col items-center">
              <div className="absolute top-[-40px] w-full flex justify-center z-20">
                  <select 
                      value={email}
                      onChange={(e) => handleUserChange(i, e.target.value)}
                      className="text-center text-slate-700 text-[13px] font-black tracking-widest uppercase bg-slate-200/90 backdrop-blur rounded-full py-1.5 px-3 z-10 border border-slate-400 shadow-sm outline-none cursor-pointer hover:bg-slate-300 transition-colors max-w-[280px] truncate"
                  >
                      {ffs.map(f => (
                          <option key={f.email} value={f.email}>{f.name}</option>
                      ))}
                      {!ffs.find(f => f.email === email) && (
                          <option value={email}>{email.split('@')[0].replace('.', ' ')}</option>
                      )}
                  </select>
              </div>
              <MobileFrame email={email} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
