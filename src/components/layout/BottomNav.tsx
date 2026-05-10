'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, CalendarCheck, UserCircle, BellRing, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function BottomNav({ className, currentTab, onNavigate, testEmail }: { className?: string, currentTab?: string, onNavigate?: (href: string) => void, testEmail?: string }) {
    const pathname = usePathname();
    const activePath = currentTab || pathname;

    const navItems = [
        { label: 'Availability', href: '/mobile/availability', icon: CalendarCheck },
        { label: 'Offers', href: '/mobile/offers', icon: Inbox },
        { label: 'Roster', href: '/mobile/confirmed', icon: CalendarDays },
        { label: 'Profile', href: '/mobile/profile', icon: UserCircle },
    ];

    const [pendingCount, setPendingCount] = React.useState(0);

    React.useEffect(() => {
        async function fetchPending() {
            let email = testEmail;
            if (!email) {
                // Only perform session check if no testEmail is provided to prevent lock contention in Matrix
                const { data: { session } } = await supabase.auth.getSession();
                email = session?.user?.email;
            }
            if (!email) return;

            const { data: ff } = await supabase.from('firefighters').select('id').eq('email', email).single();
            if (ff) {
                const { count } = await supabase.from('ot_offers').select('*', { count: 'exact', head: true }).eq('firefighter_id', ff.id).eq('status', 'sent');
                setPendingCount(count || 0);
            }
        }
        fetchPending();
        
        // Polling fallback (every 15 seconds)
        const pollInterval = setInterval(fetchPending, 15000);

        // Realtime subscription
        const uniqueId = Math.random().toString(36).substring(2, 9);
        const channelName = `offers_changes_${(testEmail || 'current').replace(/[@.]/g, '_')}_${uniqueId}`;
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ot_offers' }, () => {
                fetchPending();
            })
            .subscribe();

        return () => { 
            clearInterval(pollInterval);
            supabase.removeChannel(channel); 
        };
    }, [testEmail]);

    return (
        <nav className={cn(
            "bg-[#005DAC] pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]",
            className || "fixed bottom-0 left-0 right-0 md:hidden"
        )}>
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = activePath === item.href || (activePath === '/mobile' && item.href === '/mobile/availability');
                    const Icon = item.icon;

                    if (onNavigate) {
                        return (
                            <button
                                key={item.href}
                                onClick={() => onNavigate(item.href)}
                                className="flex flex-col items-center justify-center flex-1 h-full"
                            >
                                <div className="relative">
                                    <Icon className={cn(
                                        "w-6 h-6 mb-1 transition-colors",
                                        isActive ? "text-white" : "text-blue-300/70"
                                    )} />
                                    {item.label === 'Offers' && pendingCount > 0 && (
                                        <div className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                            {pendingCount}
                                        </div>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[11px] font-medium transition-colors",
                                    isActive ? "text-white" : "text-blue-300/70"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 h-full"
                        >
                            <div className="relative">
                                <Icon className={cn(
                                    "w-6 h-6 mb-1 transition-colors",
                                    isActive ? "text-white" : "text-blue-300/70"
                                )} />
                                {item.label === 'Offers' && pendingCount > 0 && (
                                    <div className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                        {pendingCount}
                                    </div>
                                )}
                            </div>
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