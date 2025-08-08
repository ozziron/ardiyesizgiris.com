// app/api/calculate/route.ts
import { NextResponse } from "next/server";
import { addDays, differenceInCalendarDays, parseISO } from "date-fns";

export async function POST(request: Request) {
  const { liman, hat, kalkisTarihi, gateInTarihi } = await request.json();
  const freeDays = 5;
  const kalkisDate = parseISO(kalkisTarihi);
  const startDate = gateInTarihi ? parseISO(gateInTarihi) : kalkisDate;
  const freeUntilDate = addDays(startDate, freeDays);
  const now = new Date();
  const daysLeft = differenceInCalendarDays(freeUntilDate, now);
  return NextResponse.json({
    freeDays,
    freeUntil: freeUntilDate.toISOString().split("T")[0],
    daysLeft,
  });
}
