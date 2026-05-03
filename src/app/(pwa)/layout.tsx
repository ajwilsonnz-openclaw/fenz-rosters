'use client';

import BottomNav from "@/components/layout/BottomNav";
import Image from "next/image";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PWALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dynamically set the title based on the current mobile tab
  let title = "FENZ OT";
  if (pathname === '/availability' || pathname === '/') title = "AVAILABILITY";
  if (pathname === '/offers') title = "MY OFFERS";
  if (pathname === '/confirmed') title = "MY ROSTER";
  if (pathname === '/profile') title = "PROFILE";
  if (pathname === '/notifications') title = "NOTIFICATIONS";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* UNIFIED FENZ HEADER */}
      <header className="w-full bg-[#005DAC] text-white shadow-md sticky top-0 z-50 h-14">
        <div className="flex h-full items-center justify-between px-4">

          {/* LEFT: Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Image
              src="/fenz-logo.svg"
              alt="FENZ Logo"
              width={120}
              height={28}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* CENTER: Dynamic Page Title */}
          <div className="flex-[2] flex justify-center">
            <span className="font-black uppercase tracking-widest text-[13px]">{title}</span>
          </div>

          {/* RIGHT: Profile Icon */}
          <div className="flex-1 flex justify-end">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
              <User className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>

        </div>
      </header>

      <main className="flex-1 pb-20">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}