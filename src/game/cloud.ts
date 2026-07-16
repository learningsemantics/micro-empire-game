export type CloudSave = {
  save: Record<string, unknown>;
  schemaVersion: number;
  clientSavedAt: string;
  updatedAt: string;
};

export function saveTimestamp(value: unknown) {
  if (!value || typeof value !== "object") return 0;
  const savedAt = (value as { savedAt?: unknown }).savedAt;
  if (typeof savedAt !== "string") return 0;
  const timestamp = Date.parse(savedAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function normalizeCloudSave(value: unknown): CloudSave | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<CloudSave>;
  if (
    !input.save ||
    typeof input.save !== "object" ||
    typeof input.clientSavedAt !== "string" ||
    !saveTimestamp({ savedAt: input.clientSavedAt }) ||
    typeof input.updatedAt !== "string"
  )
    return null;
  return {
    save: input.save as Record<string, unknown>,
    schemaVersion: Number(input.schemaVersion) || 1,
    clientSavedAt: input.clientSavedAt,
    updatedAt: input.updatedAt,
  };
}

export function newerSave(
  local: unknown,
  remote: Pick<CloudSave, "clientSavedAt">,
) {
  const localTime = saveTimestamp(local);
  const remoteTime = saveTimestamp({ savedAt: remote.clientSavedAt });
  if (remoteTime > localTime) return "remote" as const;
  if (localTime > remoteTime) return "local" as const;
  return "same" as const;
}
