import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AuthPublicConfig = {
  configured: boolean;
  url?: string;
  publishableKey?: string;
};

let clientPromise: Promise<SupabaseClient | null> | null = null;

export function normalizeAuthConfig(value: unknown): AuthPublicConfig {
  if (!value || typeof value !== "object") return { configured: false };
  const input = value as Partial<AuthPublicConfig>;
  if (
    input.configured !== true ||
    typeof input.url !== "string" ||
    !input.url.startsWith("https://") ||
    typeof input.publishableKey !== "string" ||
    input.publishableKey.length < 20
  )
    return { configured: false };
  return {
    configured: true,
    url: input.url,
    publishableKey: input.publishableKey,
  };
}

export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (import.meta.env.BASE_URL !== "/") return Promise.resolve(null);
  if (!clientPromise)
    clientPromise = fetch("/api/auth-config", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then(normalizeAuthConfig)
      .then((config) =>
        config.configured && config.url && config.publishableKey
          ? createClient(config.url, config.publishableKey, {
              auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
              },
            })
          : null,
      )
      .catch(() => null);
  return clientPromise;
}
