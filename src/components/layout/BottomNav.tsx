'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, CalendarCheck, UserCircle, BellRing, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Availability', href: '/availability', icon: CalendarCheck },
        { label: 'Offers', href: '/offers', icon: Inbox },
        { label: 'Roster', href: '/confirmed', icon: CalendarDays },
        { label: 'Profile', href: '/profile', icon: UserCircle },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#005DAC] pb-safe z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname === '/' && item.href === '/availability');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 h-full"
                        >
                            <Icon className={cn(
                                "w-6 h-6 mb-1 transition-colors",
                                isActive ? "text-white" : "text-blue-300/70"
                            )} />
                            <span className={cn(
                                "text-[11px] font-medium transition-colors",
                                isActive ? "text-white" : "text-blue-300/70"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}