declare const process: { env: Record<string, string | undefined> };

export function GET() {
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
  const configured = Boolean(url && publishableKey);
  if (!configured)
    return Response.json(
      { configured: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  return Response.json(
    { configured: true, url, publishableKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
