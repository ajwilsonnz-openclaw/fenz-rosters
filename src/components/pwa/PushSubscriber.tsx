'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export default function PushSubscriber() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        
        if (subscription) {
            // Already subscribed, ensure it's in the DB for the current user session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: ff } = await supabase.from('firefighters').select('id').eq('email', session.user.email).single();
                if (ff) {
                    await fetch('/api/push/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subscription, firefighterId: ff.id })
                    }).catch(console.error);
                }
            }
        } else if (Notification.permission !== 'denied') {
            setShowPrompt(true);
        }
    };

    const subscribeToPush = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setShowPrompt(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            
            if (!publicVapidKey) {
                console.error("No VAPID public key available");
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Get logged in firefighter ID
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const { data: ff } = await supabase.from('firefighters').select('id').eq('email', session.user.email).single();
            if (!ff) return;

            // Send to server
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription, firefighterId: ff.id })
            });

            setIsSubscribed(true);
            setShowPrompt(false);
        } catch (error) {
            console.error('Error subscribing to push:', error);
        }
    };

    if (!isSupported || !showPrompt || isSubscribed) {
        return null;
    }

    return (
        <div className="fixed top-16 left-4 right-4 bg-white rounded-2xl shadow-xl border border-blue-100 p-4 z-[60] flex flex-col gap-3">
            <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full mt-1 shrink-0">
                    <BellRing className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-[15px]">Enable Notifications</h3>
                    <p className="text-sm text-slate-600 mt-1">Get instant alerts when you are offered overtime shifts.</p>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-1">
                <Button variant="ghost" className="text-slate-500 h-9" onClick={() => setShowPrompt(false)}>Later</Button>
                <Button className="bg-[#005DAC] hover:bg-blue-700 h-9" onClick={subscribeToPush}>Enable</Button>
            </div>
        </div>
    );
}
