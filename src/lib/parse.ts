// Lightweight natural-language task parser.
// Handles: !1/!2/!3 priority, #category, today/tomorrow/weekday, HH[:MM]am|pm, "30m" / "1h" duration.

export interface ParsedInput {
  title: string;
  priority: 1 | 2 | 3;
  category?: string;
  scheduledStart?: Date;
  estimatedMinutes?: number;
  dueDate?: Date;
}

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function parseQuickAdd(raw: string, now = new Date()): ParsedInput {
  let s = raw.trim();
  let priority: 1 | 2 | 3 = 3;
  let category: string | undefined;
  let scheduledStart: Date | undefined;
  let estimatedMinutes: number | undefined;

  // priority !1 / !2 / !3 — anywhere in the string
  const pm = s.match(/(?:^|\s)!([123])(?=\s|$)/);
  if (pm) {
    priority = Number(pm[1]) as 1 | 2 | 3;
    s = s.replace(pm[0], " ").trim();
  }

  // category #word — anywhere in the string
  const cm = s.match(/(?:^|\s)#(\w+)(?=\s|$)/);
  if (cm) {
    category = cm[1];
    s = s.replace(cm[0], " ").trim();
  }

  // duration 30m / 1h / 1h30m — must be standalone, not part of a larger token
  const dm = s.match(/(?:^|\s)(\d+)h(\d+)?m?(?=\s|$)|(?:^|\s)(\d+)m(?=\s|$)/i);
  if (dm) {
    if (dm[1]) estimatedMinutes = Number(dm[1]) * 60 + (dm[2] ? Number(dm[2]) : 0);
    else if (dm[3]) estimatedMinutes = Number(dm[3]);
    s = s.replace(dm[0], " ").trim();
  }

  // day — today / tomorrow / weekday
  let dayBase = new Date(now);
  dayBase.setHours(0, 0, 0, 0);
  let gotDay = false;

  if (/\btoday\b/i.test(s)) {
    gotDay = true;
    s = s.replace(/\btoday\b/i, "").trim();
  } else if (/\btomorrow\b/i.test(s)) {
    dayBase.setDate(dayBase.getDate() + 1);
    gotDay = true;
    s = s.replace(/\btomorrow\b/i, "").trim();
  } else {
    for (let i = 0; i < WEEKDAYS.length; i++) {
      const w = WEEKDAYS[i];
      const re = new RegExp(`\\b${w}\\b`, "i");
      if (re.test(s)) {
        const delta = (i - dayBase.getDay() + 7) % 7 || 7;
        dayBase.setDate(dayBase.getDate() + delta);
        gotDay = true;
        s = s.replace(re, "").trim();
        break;
      }
    }
  }

  // Time — must have am/pm OR a colon. A bare "3" is NOT a time.
  const tm =
    s.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i) ||
    s.match(/\b(\d{1,2})\s*(am|pm)\b/i);
  if (tm) {
    let h = Number(tm[1]);
    const hasColon = tm[0].includes(":");
    const m = hasColon ? Number(tm[2]) : 0;
    const suf = (hasColon ? tm[3] : tm[2])?.toLowerCase();
    if (suf === "pm" && h < 12) h += 12;
    if (suf === "am" && h === 12) h = 0;
    if (h >= 0 && h <= 23 && m >= 0 && m < 60) {
      const d = new Date(dayBase);
      d.setHours(h, m, 0, 0);
      // If no explicit day and the time is in the past, bump to tomorrow
      if (!gotDay && d < now) d.setDate(d.getDate() + 1);
      scheduledStart = d;
      s = s.replace(tm[0], " ").trim();
    }
  }

  // Clean up residue
  s = s.replace(/\s{2,}/g, " ").trim();
  if (!s) s = raw.trim();

  return {
    title: s,
    priority,
    category,
    scheduledStart,
    estimatedMinutes,
    dueDate: gotDay && !scheduledStart ? dayBase : undefined,
  };
}
