import { describe, expect, it } from "vitest";
import { newerSave, normalizeCloudSave, saveTimestamp } from "./cloud";

describe("cloud saves", () => {
  it("compares client save times without trusting server order", () => {
    expect(
      newerSave(
        { savedAt: "2026-07-16T12:00:00.000Z" },
        { clientSavedAt: "2026-07-16T12:01:00.000Z" },
      ),
    ).toBe("remote");
    expect(
      newerSave(
        { savedAt: "2026-07-16T12:02:00.000Z" },
        { clientSavedAt: "2026-07-16T12:01:00.000Z" },
      ),
    ).toBe("local");
  });

  it("rejects malformed server responses", () => {
    expect(normalizeCloudSave({ save: {}, updatedAt: "now" })).toBeNull();
    expect(saveTimestamp({ savedAt: "not-a-date" })).toBe(0);
  });

  it("normalizes a valid cloud snapshot", () => {
    expect(
      normalizeCloudSave({
        save: { schemaVersion: 3, state: { day: 4 } },
        schemaVersion: 3,
        clientSavedAt: "2026-07-16T12:00:00.000Z",
        updatedAt: "2026-07-16T12:00:01.000Z",
      })?.schemaVersion,
    ).toBe(3);
  });
});
