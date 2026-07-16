import { bearerToken, createServerSupabase } from "./_supabase";

export async function GET(request: Request) {
  const token = bearerToken(request);
  let authenticated = false;
  if (token) {
    const supabase = createServerSupabase(token);
    if (supabase) {
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
      version: "6.2.0",
      authRequiredForCommercial: true,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
