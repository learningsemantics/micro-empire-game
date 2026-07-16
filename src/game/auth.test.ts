import { describe, expect, it } from "vitest";
import { normalizeAuthConfig } from "./auth";

describe("auth configuration", () => {
  it("accepts a complete public Supabase configuration", () => {
    expect(
      normalizeAuthConfig({
        configured: true,
        url: "https://example.supabase.co",
        publishableKey: "sb_publishable_12345678901234567890",
      }),
    ).toEqual({
      configured: true,
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_12345678901234567890",
    });
  });

  it.each([
    null,
    {},
    { configured: true },
    {
      configured: true,
      url: "javascript:alert(1)",
      publishableKey: "long-enough-key-123456789",
    },
  ])("fails closed for invalid config %#", (value) =>
    expect(normalizeAuthConfig(value)).toEqual({ configured: false }),
  );
});
