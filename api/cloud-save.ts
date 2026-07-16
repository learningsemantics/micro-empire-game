import { createClient } from "@supabase/supabase-js";

declare const process: { env: Record<string, string | undefined> };

const noStore = { "Cache-Control": "private, no-store" };

function environment() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return { url, key };
}

async function authenticatedClient(request: Request) {
  const match = /^Bearer\s+(.+)$/i.exec(
    request.headers.get("authorization") || "",
  );
  const token = match?.[1]?.trim();
  const { url, key } = environment();
  if (!token || !url || !key) return null;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  return !error && data.user ? { client, user: data.user } : null;
}

function unavailable(error: { code?: string } | null) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

export async function GET(request: Request) {
  const auth = await authenticatedClient(request);
  if (!auth)
    return Response.json(
      { error: "authentication_required" },
      { status: 401, headers: noStore },
    );
  const { data, error } = await auth.client
    .from("cloud_saves")
    .select("save_data,schema_version,client_saved_at,updated_at")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (unavailable(error))
    return Response.json(
      { error: "cloud_storage_not_configured" },
      { status: 503, headers: noStore },
    );
  if (error)
    return Response.json(
      { error: "cloud_read_failed" },
      { status: 500, headers: noStore },
    );
  if (!data)
    return Response.json(
      { error: "cloud_save_not_found" },
      { status: 404, headers: noStore },
    );
  return Response.json(
    {
      save: data.save_data,
      schemaVersion: data.schema_version,
      clientSavedAt: data.client_saved_at,
      updatedAt: data.updated_at,
    },
    { headers: noStore },
  );
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient(request);
  if (!auth)
    return Response.json(
      { error: "authentication_required" },
      { status: 401, headers: noStore },
    );
  let body: { save?: unknown; expectedUpdatedAt?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "invalid_json" },
      { status: 400, headers: noStore },
    );
  }
  if (!body.save || typeof body.save !== "object")
    return Response.json(
      { error: "invalid_save" },
      { status: 400, headers: noStore },
    );
  const save = body.save as {
    schemaVersion?: unknown;
    savedAt?: unknown;
    state?: unknown;
  };
  const serialized = JSON.stringify(save);
  if (
    !save.state ||
    typeof save.state !== "object" ||
    typeof save.savedAt !== "string" ||
    !Number.isFinite(Date.parse(save.savedAt)) ||
    serialized.length > 900_000
  )
    return Response.json(
      { error: "invalid_or_oversized_save" },
      { status: 413, headers: noStore },
    );

  if (typeof body.expectedUpdatedAt === "string") {
    const { data } = await auth.client
      .from("cloud_saves")
      .select("updated_at")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (data && data.updated_at !== body.expectedUpdatedAt)
      return Response.json(
        { error: "cloud_save_conflict", updatedAt: data.updated_at },
        { status: 409, headers: noStore },
      );
  }

  const { data, error } = await auth.client
    .from("cloud_saves")
    .upsert(
      {
        user_id: auth.user.id,
        save_data: save,
        schema_version: Number(save.schemaVersion) || 1,
        client_saved_at: save.savedAt,
      },
      { onConflict: "user_id" },
    )
    .select("schema_version,client_saved_at,updated_at")
    .single();
  if (unavailable(error))
    return Response.json(
      { error: "cloud_storage_not_configured" },
      { status: 503, headers: noStore },
    );
  if (error)
    return Response.json(
      { error: "cloud_write_failed" },
      { status: 500, headers: noStore },
    );
  return Response.json(
    {
      ok: true,
      schemaVersion: data.schema_version,
      clientSavedAt: data.client_saved_at,
      updatedAt: data.updated_at,
    },
    { headers: noStore },
  );
}
