export function GET() {
  return Response.json(
    {
      edition: "community",
      entitlement: "community",
      authenticated: false,
      source: "vercel",
      version: "6.1.0",
      authRequiredForCommercial: true,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
