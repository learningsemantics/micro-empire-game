import { createClient } from "@supabase/supabase-js";

declare const process: { env: Record<string, string | undefined> };

export async function GET(request: Request) {
  const match = /^Bearer\s+(.+)$/i.exec(
    request.headers.get("authorization") || "",
  );
  const token = match?.[1]?.trim() || null;
  let authenticated = false;
  if (token) {
    const url =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL;
    const publishableKey =
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (url && publishableKey) {
      const supabase = createClient(url, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data, error } = await supabase.auth.getUser(token);
      authenticated = !error && Boolean(data.user);
    }
  }
  return Response.json(
    {
      edition: "community",
      entitlement: "community",
      authenticated,
      source: "vercel",
      version: "6.3.0",
      authRequiredForCommercial: true,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
