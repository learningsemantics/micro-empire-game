export const SAVE_KEY = "micro-empire-save";
export const BACKUP_SAVE_KEY = "micro-empire-save-backup";
export const SAVE_SCHEMA_VERSION = 3;

type SaveEnvelope<T> = {
  schemaVersion: number;
  savedAt: string;
  state: T;
};

export function serializeSave<T>(state: T) {
  const envelope: SaveEnvelope<T> = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(envelope);
}

export function unwrapSave<T>(raw: string): {
  state: T;
  schemaVersion: number;
} {
  const parsed = JSON.parse(raw);
  if (parsed && typeof parsed === "object" && "state" in parsed) {
    return {
      state: parsed.state as T,
      schemaVersion: Number(parsed.schemaVersion) || 1,
    };
  }
  return { state: parsed as T, schemaVersion: 0 };
}

export function loadSaveWithBackup<T>(
  primary: string | null,
  backup: string | null,
): { state: T; schemaVersion: number; recovered: boolean } | null {
  if (primary) {
    try {
      return { ...unwrapSave<T>(primary), recovered: false };
    } catch {
      /* try the previous valid snapshot */
    }
  }
  if (backup) {
    try {
      return { ...unwrapSave<T>(backup), recovered: true };
    } catch {
      /* both snapshots are invalid */
    }
  }
  return null;
}

export function portableBackup<T>(data: T) {
  return JSON.stringify({
    product: "micro-empire",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    data,
  });
}

export function readPortableBackup<T>(raw: string): T {
  const parsed = JSON.parse(raw);
  if (
    !parsed ||
    parsed.product !== "micro-empire" ||
    parsed.formatVersion !== 1 ||
    !("data" in parsed)
  )
    throw new Error("Invalid Micro Empire backup");
  return parsed.data as T;
}
