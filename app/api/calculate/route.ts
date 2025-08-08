import { NextResponse } from "next/server";
import { subDays, differenceInCalendarDays, parseISO } from "date-fns";
import { FREE_TIME_ARDIYE, DEFAULT_FREE_TIME_ARDIYE } from "@/lib/rules/free-time";

export async function POST(request: Request) {
  const { liman, hat, kalkisTarihi, gateInTarihi } = await request.json();
  const key = `${liman}|${hat}`;
  const freeDays = FREE_TIME_ARDIYE[key] ?? DEFAULT_FREE_TIME_ARDIYE;
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
