export type EditionKey = "community" | "founder";
export type EntitlementState =
  "community" | "active" | "expired" | "unavailable";

export type EditionStatus = {
  edition: EditionKey;
  entitlement: EntitlementState;
  authenticated: boolean;
  source: "vercel" | "static";
  version: string;
};

export const EDITIONS = {
  community: {
    name: "Community Edition",
    price: "Free forever",
    note: "The complete V6.0 Toronto founder campaign remains free.",
    features: [
      "Complete 30-day Toronto campaign",
      "All Community scenarios and founder trials",
      "Local saves, progression and Hall of Fame",
      "Portable backup and accessibility controls",
    ],
  },
  founder: {
    name: "Founder Licence",
    price: "Commercial release",
    note: "Adds services and expansion content without removing the free game.",
    features: [
      "Cross-device cloud saves",
      "Commercial expansion campaigns",
      "Advanced founder analytics and benchmarks",
      "Priority updates and licence recovery",
    ],
  },
} as const;

export const COMMUNITY_STATUS: EditionStatus = {
  edition: "community",
  entitlement: "community",
  authenticated: false,
  source: "static",
  version: "6.3.0",
};

export function canAccessCommercial(status: EditionStatus) {
  return status.edition === "founder" && status.entitlement === "active";
}

export function normalizeEditionStatus(value: unknown): EditionStatus {
  if (!value || typeof value !== "object") return COMMUNITY_STATUS;
  const input = value as Partial<EditionStatus>;
  if (
    !["community", "founder"].includes(input.edition || "") ||
    !["community", "active", "expired", "unavailable"].includes(
      input.entitlement || "",
    )
  )
    return COMMUNITY_STATUS;
  return {
    edition: input.edition as EditionKey,
    entitlement: input.entitlement as EntitlementState,
    authenticated: Boolean(input.authenticated),
    source: input.source === "vercel" ? "vercel" : "static",
    version: String(input.version || "6.3.0"),
  };
}
