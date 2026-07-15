export const SAVE_KEY = "micro-empire-save";
export const SAVE_SCHEMA_VERSION = 2;

type SaveEnvelope<T> = {
  schemaVersion: number;
  savedAt: string;
  state: T;
};

export function serializeSave<T>(state: T) {
  const envelope: SaveEnvelope<T> = { schemaVersion: SAVE_SCHEMA_VERSION, savedAt: new Date().toISOString(), state };
  return JSON.stringify(envelope);
}

export function unwrapSave<T>(raw: string): { state: T; schemaVersion: number } {
  const parsed = JSON.parse(raw);
  if (parsed && typeof parsed === "object" && "state" in parsed) {
    return { state: parsed.state as T, schemaVersion: Number(parsed.schemaVersion) || 1 };
  }
  return { state: parsed as T, schemaVersion: 0 };
}
