import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Sends a push notification to every subscribed staff device (Emily's phone,
// Jeff's phone, …). Dead subscriptions are pruned automatically. Never throws —
// a push failure must not break the flow that triggered it.

let configured = false;
function configure(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:properties@canyon-advisors.com', pub, priv);
  configured = true;
  return true;
}

export async function sendPushToStaff(payload: { title: string; body: string; url?: string }, topic?: string) {
  try {
    if (!configure()) return;
    const db = supabaseAdmin();
    let subs: { id: string; subscription: webpush.PushSubscription }[] | null = null;
    const withMutes = await db.from('push_subscriptions').select('id, subscription, muted_topics');
    if (withMutes.error) {
      // muted_topics migration not run yet — fall back to everyone
      subs = (await db.from('push_subscriptions').select('id, subscription')).data;
    } else {
      subs = (withMutes.data ?? []).filter(row =>
        !topic || !((row as { muted_topics?: string[] }).muted_topics ?? []).includes(topic));
    }
    if (!subs?.length) return;
    await Promise.all(subs.map(async row => {
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify(payload));
      } catch (e: unknown) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await db.from('push_subscriptions').delete().eq('id', row.id);
        }
      }
    }));
  } catch { /* never let push failures break the caller */ }
}
