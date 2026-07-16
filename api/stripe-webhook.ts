import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

declare const process: { env: Record<string, string | undefined> };

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const signature = request.headers.get("stripe-signature");
  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey)
    return Response.json({ error: "webhook_not_configured" }, { status: 503 });
  if (!signature)
    return Response.json({ error: "signature_required" }, { status: 400 });

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch {
    return Response.json({ error: "invalid_signature" }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (event.type.startsWith("customer.subscription.")) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    let userId = subscription.metadata.user_id;
    if (!userId) {
      const { data } = await admin
        .from("billing_customers")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      userId = data?.user_id;
    }
    if (userId) {
      const { data: current } = await admin
        .from("subscriptions")
        .select("stripe_event_created")
        .eq("user_id", userId)
        .maybeSingle();
      if (
        current?.stripe_event_created &&
        current.stripe_event_created > event.created
      )
        return Response.json({ received: true, ignored: "older_event" });
      const item = subscription.items.data[0];
      const periodEnd = item?.current_period_end;
      const { error } = await admin.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: item?.price.id || null,
        status: subscription.status,
        current_period_end: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        stripe_event_created: event.created,
      });
      if (error)
        return Response.json(
          { error: "subscription_sync_failed" },
          { status: 500 },
        );
    }
  }
  return Response.json({ received: true });
}
