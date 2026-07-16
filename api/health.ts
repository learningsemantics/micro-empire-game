export function GET() {
  return Response.json(
    {
      ok: true,
      service: "micro-empire-commercial",
      version: "6.2.0",
      runtime: "vercel",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
