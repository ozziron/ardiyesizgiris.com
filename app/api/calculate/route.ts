import { NextResponse } from "next/server";
import { subDays, differenceInCalendarDays, parseISO } from "date-fns";

export async function POST(request: Request) {
  const { liman, hat, kalkisTarihi, gateInTarihi } = await request.json();
  const freeDays = 5;
  const kalkisDate = parseISO(kalkisTarihi);

  // Kalkış günü 1. gün sayılarak (freeDays - 1) gün geriye gidiliyor
  const freeUntilDate = subDays(kalkisDate, freeDays - 1);

  const now = new Date();
  const daysLeft = differenceInCalendarDays(freeUntilDate, now);

  return NextResponse.json({
    freeDays,
    freeUntil: freeUntilDate.toISOString().split("T")[0],  // örn. "2025-08-27"
    daysLeft,
  });
}
