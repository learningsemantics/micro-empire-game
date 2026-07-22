export function GET() {
  return Response.json(
    {
      ok: true,
      service: "micro-empire-commercial",
      version: "6.4.2",
      runtime: "vercel",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

