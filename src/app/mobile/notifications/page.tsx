'use client';

import * as React from "react";
import { BellRing, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotificationsPage() {
    const [permission, setPermission] = React.useState<string>("default");

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col gap-1 px-1">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Notifications</h1>
                <p className="text-slate-500 text-sm font-medium">Control how you receive shift alerts.</p>
            </div>

            <Card className="p-6 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${permission === 'granted' ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <BellRing className={`w-10 h-10 ${permission === 'granted' ? 'text-green-600' : 'text-amber-600'}`} />
                </div>

                <div>
                    <h3 className="text-lg font-black text-slate-900">
                        {permission === 'granted' ? 'Notifications Enabled' : 'Notifications Disabled'}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium px-4">
                        {permission === 'granted'
                            ? "You're all set! You will receive push notifications when a new offer is available."
                            : "We need your permission to alert you about new overtime shifts so you don't miss out."}
                    </p>
                </div>

                {permission !== 'granted' && (
                    <Button onClick={requestPermission} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-6 font-black uppercase text-xs shadow-lg shadow-blue-100">
                        Enable Push Notifications
                    </Button>
                )}
            </Card>
        </div>
    );
}