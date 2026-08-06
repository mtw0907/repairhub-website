const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
type DayKey = (typeof DAY_KEYS)[number];

type OpenStatus =
  | { status: "OPEN"; label: string; closesAt: string }
  | { status: "CLOSED"; label: string; opensAt?: string; opensDay?: string }
  | { status: "HOLIDAY"; label: string }
  | { status: "UNKNOWN"; label: string };

function todayKey(now: Date): DayKey {
  return DAY_KEYS[now.getDay()];
}

function parseHours(json: string | null): Partial<Record<DayKey, string>> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function parseClosedDays(json: string | null): DayKey[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((d): d is DayKey => DAY_KEYS.includes(d)) : [];
  } catch {
    return [];
  }
}

/** "10:00-19:00" -> { openMin, closeMin } as minutes-since-midnight. Returns null if malformed. */
function parseRange(range: string | undefined): { openMin: number; closeMin: number } | null {
  if (!range) return null;
  const match = range.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, oh, om, ch, cm] = match;
  return {
    openMin: Number(oh) * 60 + Number(om),
    closeMin: Number(ch) * 60 + Number(cm),
  };
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Real-time open/closed status for a company, given the two raw JSON columns on Company. */
export function getOpenStatus(
  businessHoursJson: string | null,
  closedDaysJson: string | null,
  now: Date = new Date(),
): OpenStatus {
  const hours = parseHours(businessHoursJson);
  const closedDays = parseClosedDays(closedDaysJson);
  if (Object.keys(hours).length === 0) return { status: "UNKNOWN", label: "" };

  const key = todayKey(now);
  if (closedDays.includes(key)) return { status: "HOLIDAY", label: "휴무" };

  const range = parseRange(hours[key]);
  if (!range) return { status: "HOLIDAY", label: "휴무" };

  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin >= range.openMin && nowMin < range.closeMin) {
    return { status: "OPEN", label: "영업중", closesAt: formatMinutes(range.closeMin) };
  }
  if (nowMin < range.openMin) {
    return { status: "CLOSED", label: "영업 전", opensAt: formatMinutes(range.openMin) };
  }
  return { status: "CLOSED", label: "영업 종료" };
}

/**
 * Heuristic "available today" slot candidates: every 2 hours within today's
 * business hours, excluding the past and excluding hours that already have a
 * reservation. There's no real booking-capacity model in the schema yet, so
 * this approximates availability rather than guaranteeing it.
 */
export function getTodaySlots(
  businessHoursJson: string | null,
  closedDaysJson: string | null,
  bookedTimes: string[],
  now: Date = new Date(),
  maxSlots = 3,
): string[] {
  const hours = parseHours(businessHoursJson);
  const closedDays = parseClosedDays(closedDaysJson);
  const key = todayKey(now);
  if (closedDays.includes(key)) return [];

  const range = parseRange(hours[key]);
  if (!range) return [];

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const bookedHours = new Set(bookedTimes.map((t) => t.slice(0, 2)));

  const slots: string[] = [];
  const firstSlot = Math.ceil(range.openMin / 120) * 120;
  for (let min = firstSlot; min < range.closeMin; min += 120) {
    if (min <= nowMin) continue;
    const label = formatMinutes(min);
    if (bookedHours.has(label.slice(0, 2))) continue;
    slots.push(label);
    if (slots.length >= maxSlots) break;
  }
  return slots;
}
