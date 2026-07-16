import { getSupabaseEnvironment } from "./_supabase";

export function GET() {
  const { url, publishableKey, configured } = getSupabaseEnvironment();
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
