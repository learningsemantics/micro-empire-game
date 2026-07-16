import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

declare const process: { env: Record<string, string | undefined> };

const noStore = { "Cache-Control": "private, no-store" };

export async function POST(request: Request) {
  const match = /^Bearer\s+(.+)$/i.exec(
    request.headers.get("authorization") || "",
  );
  const token = match?.[1]?.trim();
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_FOUNDER_PRICE_ID;
  if (!token)
    return Response.json(
      { error: "authentication_required" },
      { status: 401, headers: noStore },
    );
  if (!supabaseUrl || !publishableKey || !serviceKey || !stripeKey || !priceId)
    return Response.json(
      { error: "billing_not_configured" },
      { status: 503, headers: noStore },
    );

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } =
    await userClient.auth.getUser(token);
  if (userError || !userData.user)
    return Response.json(
      { error: "invalid_session" },
      { status: 401, headers: noStore },
    );

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const stripe = new Stripe(stripeKey);
  const { data: activeSubscription } = await admin
    .from("subscriptions")
    .select("status")
    .eq("user_id", userData.user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();
  if (activeSubscription)
    return Response.json(
      { error: "founder_licence_already_active" },
      { status: 409, headers: noStore },
    );
  const { data: existing } = await admin
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  let customerId = existing?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData.user.email,
      metadata: { user_id: userData.user.id },
    });
    customerId = customer.id;
    const { error } = await admin.from("billing_customers").upsert({
      user_id: userData.user.id,
      stripe_customer_id: customerId,
    });
    if (error)
      return Response.json(
        { error: "billing_customer_failed" },
        { status: 500, headers: noStore },
      );
  }

  const configuredUrl = process.env.APP_URL;
  const origin = configuredUrl || new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userData.user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelled`,
    subscription_data: { metadata: { user_id: userData.user.id } },
    metadata: { user_id: userData.user.id },
  });
  if (!session.url)
    return Response.json(
      { error: "checkout_url_missing" },
      { status: 500, headers: noStore },
    );
  return Response.json({ url: session.url }, { headers: noStore });
}
