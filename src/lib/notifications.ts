import webPush from 'web-push';
import { supabase } from './supabase';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:test@fireandemergency.nz',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function sendPushNotification(firefighterId: number, title: string, body: string, url: string = '/offers') {
    try {
        const { data: sub } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('firefighter_id', firefighterId)
            .single();

        if (sub?.subscription) {
            const payload = JSON.stringify({ title, body, url });
            await webPush.sendNotification(sub.subscription, payload);
            return true;
        }
    } catch (err) {
        console.error('Push Notification Error:', err);
    }
    return false;
}
