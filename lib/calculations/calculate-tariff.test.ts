import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma BEFORE importing the function under test.
// vi.mock is hoisted, so the mock instance must be created via vi.hoisted.
const { findFirstMock } = vi.hoisted(() => ({ findFirstMock: vi.fn() }));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    tariffRule: { findFirst: findFirstMock },
  },
}));

import { calculateArdiye } from "./calculate-tariff";

// Helper: build a TariffRule fixture where Tier 1 is the "muafiyet" window
// (tier1PricePerDay = 0). Tier 2 starts at tier1DaysTo + 1.
function tariff(overrides: Partial<{
  tier1DaysFrom: number;
  tier1DaysTo: number;
  tier1Price: number;
  tier2DaysFrom: number;
  tier2DaysTo: number;
  tier2Price: number;
  tier3DaysFrom: number;
  tier3Price: number;
  currency: string;
}> = {}) {
  const o = {
    tier1DaysFrom: 1,
    tier1DaysTo: 7,
    tier1Price: 0,
    tier2DaysFrom: 8,
    tier2DaysTo: 14,
    tier2Price: 100,
    tier3DaysFrom: 15,
    tier3Price: 200,
    currency: "TRY",
    ...overrides,
  };
  return {
    tier1DaysFrom: o.tier1DaysFrom,
    tier1DaysTo: o.tier1DaysTo,
    tier1PricePerDay: o.tier1Price,
    tier2DaysFrom: o.tier2DaysFrom,
    tier2DaysTo: o.tier2DaysTo,
    tier2PricePerDay: o.tier2Price,
    tier3DaysFrom: o.tier3DaysFrom,
    tier3PricePerDay: o.tier3Price,
    currency: o.currency,
  };
}

const baseInput = {
  portId: "P1",
  shippingCompanyId: "S1",
  containerType: "40DC",
  departureDate: new Date("2026-06-23T00:00:00Z"),
};

describe("calculateArdiye", () => {
  beforeEach(() => {
    findFirstMock.mockReset();
  });

  it("Senaryo 1: gate-in inside muafiyet -> total_charge 0", async () => {
    findFirstMock.mockResolvedValue(tariff());
    const result = await calculateArdiye({
      ...baseInput,
      gateInDate: new Date("2026-06-20T00:00:00Z"),
    });
    expect(result.free_days).toBe(7);
    expect(result.total_days_at_port).toBe(4);
    expect(result.chargeable_days).toBe(0);
    expect(result.total_charge).toBe(0);
    expect(result.warning).toBeUndefined();
  });

  it("Senaryo 2: gate-in before muafiyet -> tier2 days charged", async () => {
    findFirstMock.mockResolvedValue(tariff());
    const result = await calculateArdiye({
      ...baseInput,
      gateInDate: new Date("2026-06-13T00:00:00Z"),
    });
    expect(result.total_days_at_port).toBe(11);
    expect(result.free_period_days).toBe(7);
    expect(result.chargeable_days).toBe(4);
    // 7 free (tier1 @ 0) + 4 days × 100 (tier2)
    expect(result.total_charge).toBe(400);
    const t1 = result.charge_breakdown.find((b) => b.tier === 1);
    const t2 = result.charge_breakdown.find((b) => b.tier === 2);
    expect(t1).toMatchObject({ days: 7, subtotal: 0 });
    expect(t2).toMatchObject({ days: 4, subtotal: 400 });
  });

  it("Senaryo 3: gate-in after departure -> warning surfaced", async () => {
    findFirstMock.mockResolvedValue(tariff());
    const result = await calculateArdiye({
      ...baseInput,
      gateInDate: new Date("2026-06-25T00:00:00Z"),
    });
    expect(result.warning).toMatch(/sonra/i);
  });

  it("Planning mode: no gateInDate -> only free_until set, zero charges", async () => {
    findFirstMock.mockResolvedValue(tariff());
    const result = await calculateArdiye(baseInput);
    expect(result.free_days).toBe(7);
    expect(result.total_charge).toBe(0);
    expect(result.charge_breakdown).toEqual([]);
    expect(result.total_days_at_port).toBe(0);
    // free_until_date = departure - 7 + 1 = 17.06
    expect(result.free_until_date.toISOString().slice(0, 10)).toBe("2026-06-17");
  });

  it("Manuel örnek: 5 gün muafiyet ve gate-in muafiyet içinde -> charge 0", async () => {
    findFirstMock.mockResolvedValue(tariff({ tier1DaysTo: 5, tier2DaysFrom: 6, tier2DaysTo: 10 }));

    const result = await calculateArdiye({
      ...baseInput,
      departureDate: new Date("2026-06-01T00:00:00Z"),
      gateInDate: new Date("2026-05-30T00:00:00Z"),
    });

    expect(result.free_days).toBe(5);
    expect(result.free_until_date.toISOString().slice(0, 10)).toBe("2026-05-28");
    expect(result.total_days_at_port).toBe(3);
    expect(result.free_period_days).toBe(3);
    expect(result.chargeable_days).toBe(0);
    expect(result.total_charge).toBe(0);
  });

  it("Tier 1 muafiyet uzunluğunu DaysFrom..DaysTo aralığından hesaplar", async () => {
    findFirstMock.mockResolvedValue(
      tariff({
        tier1DaysFrom: 3,
        tier1DaysTo: 7,
        tier2DaysFrom: 8,
        tier2DaysTo: 14,
      })
    );

    const result = await calculateArdiye({
      ...baseInput,
      gateInDate: new Date("2026-06-13T00:00:00Z"),
    });

    expect(result.free_days).toBe(5);
    expect(result.free_until_date.toISOString().slice(0, 10)).toBe("2026-06-19");
    expect(result.total_days_at_port).toBe(11);
    expect(result.free_period_days).toBe(5);
    expect(result.chargeable_days).toBe(6);
    expect(result.charge_breakdown.find((b) => b.tier === 1)).toMatchObject({
      days: 5,
      subtotal: 0,
    });
    expect(result.charge_breakdown.find((b) => b.tier === 2)).toMatchObject({
      days: 6,
      subtotal: 600,
    });
  });

  it("Tier 3 overflow: stay longer than tier2DaysTo", async () => {
    findFirstMock.mockResolvedValue(tariff({ tier2DaysTo: 10 }));
    // 16 days at port: tier1=7, tier2=3 (10-7), tier3=6
    const result = await calculateArdiye({
      ...baseInput,
      gateInDate: new Date("2026-06-08T00:00:00Z"),
    });
    expect(result.total_days_at_port).toBe(16);
    expect(result.total_charge).toBe(3 * 100 + 6 * 200); // 1500
    expect(result.charge_breakdown.map((b) => b.tier)).toEqual([1, 2, 3]);
  });

  it("No matching tariff -> throws", async () => {
    findFirstMock.mockResolvedValue(null);
    await expect(calculateArdiye(baseInput)).rejects.toThrow(/tarife bulunamadı/);
  });
});
