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
  "adam.wilson@fireandemergency.nz",
  "sarah.mitchell@fenz.slack.com",
  "tane.rawiri@fenz.slack.com",
  "liam.obrien@fenz.slack.com",
  "aroha.te rangi@fenz.slack.com",
  "marcus.williams@fenz.slack.com",
  "kahu.makiha@fenz.slack.com",
  "rebecca.taylor@fenz.slack.com",
  "luke.tanner@fenz.slack.com",
  "tommy.ahu@fenz.slack.com",
  "fiona.cameron@fenz.slack.com",
  "sam.tong@fenz.slack.com"
];

function MobileFrame({ email }: { email: string }) {
  const [currentTab, setCurrentTab] = React.useState('/availability');

  const renderContent = () => {
    switch (currentTab) {
      case '/profile':
        return <ProfileView testEmail={email} />;
      case '/offers':
        return <OffersView testEmail={email} />;
      case '/confirmed':
        return <ConfirmedView testEmail={email} />;
      case '/availability':
      default:
        return <AvailabilityView testEmail={email} isMatrix={true} />;
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case '/profile': return 'PROFILE';
      case '/offers': return 'OFFERS';
      case '/confirmed': return 'ROSTER';
      case '/availability':
      default: return 'AVAILABILITY';
    }
  };

  return (
    <div className="w-[375px] h-[900px] bg-slate-50 border-[8px] border-slate-900 rounded-[3rem] shadow-xl overflow-hidden flex flex-col relative scale-[0.80] origin-top">
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
        <div className="flex flex-wrap gap-x-2 gap-y-12 justify-center pt-8">
          {TEST_USERS.map(email => (
            <div key={email} className="h-[740px] relative flex flex-col items-center">
              <div className="absolute top-[-30px] w-full text-center text-slate-700 text-[15px] font-black tracking-widest uppercase bg-slate-200/80 backdrop-blur rounded-full py-1 z-10 border border-slate-300 shadow-sm">
                {email.split('@')[0].replace('.', ' ')}
              </div>
              <MobileFrame email={email} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
