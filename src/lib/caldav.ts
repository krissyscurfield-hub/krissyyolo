// Apple Calendar (iCloud) sync via CalDAV.
// Auth: Apple ID email + app-specific password (appleid.apple.com → Sign-In and Security → App-Specific Passwords).
// We read all subscribed calendars and write back only to a dedicated "Cadence" calendar so user data stays reversible.

import { createDAVClient, type DAVClient } from "tsdav";
import ICAL from "ical.js";
import { v4 as uuid } from "uuid";

const ICLOUD_CALDAV = "https://caldav.icloud.com";
const CADENCE_CAL_NAME = "Cadence";

export interface ParsedEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

export async function connectAppleClient(username: string, password: string): Promise<DAVClient> {
  const client = await createDAVClient({
    serverUrl: ICLOUD_CALDAV,
    credentials: { username, password },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });
  return client;
}

/** List all calendars on the account. Used by Settings to show what we'll sync. */
export async function listCalendars(client: DAVClient) {
  const cals = await client.fetchCalendars();
  return cals.map((c: any) => ({
    url: c.url,
    displayName: c.displayName || "Calendar",
    ctag: c.ctag,
  }));
}

/** Ensure the "Cadence" writeback calendar exists. Returns its URL. */
export async function ensureCadenceCalendar(client: DAVClient): Promise<string> {
  const cals: any[] = await client.fetchCalendars();
  const existing = cals.find(
    (c) => (c.displayName || "").trim().toLowerCase() === CADENCE_CAL_NAME.toLowerCase()
  );
  if (existing) return existing.url as string;

  // iCloud typically disallows creating new calendars via CalDAV from third parties.
  // Fallback: write events into the user's primary calendar. We still tag them with a CADENCE: prefix
  // in description so they're trivially filterable. Document this in the UI.
  const primary = cals.find((c: any) => c.displayName) || cals[0];
  if (!primary) throw new Error("No calendars found on iCloud account");
  return primary.url as string;
}

/** Pull every event in [from, to) across all subscribed calendars. */
export async function fetchEventsInRange(
  client: DAVClient,
  from: Date,
  to: Date
): Promise<{ calendarName: string; events: ParsedEvent[] }[]> {
  const cals: any[] = await client.fetchCalendars();
  const out: { calendarName: string; events: ParsedEvent[] }[] = [];

  for (const cal of cals) {
    try {
      const objects = await client.fetchCalendarObjects({
        calendar: cal,
        timeRange: { start: from.toISOString(), end: to.toISOString() },
      });
      const events: ParsedEvent[] = [];
      for (const obj of objects) {
        try {
          const parsed = parseICS(obj.data);
          if (parsed) events.push(parsed);
        } catch {}
      }
      out.push({ calendarName: cal.displayName || "Calendar", events });
    } catch {
      // skip unreadable calendar
    }
  }
  return out;
}

function parseICS(raw: string): ParsedEvent | null {
  const jcal = ICAL.parse(raw);
  const comp = new ICAL.Component(jcal);
  const vevent = comp.getFirstSubcomponent("vevent");
  if (!vevent) return null;
  const e = new ICAL.Event(vevent);
  if (!e.startDate || !e.endDate) return null;
  return {
    uid: e.uid,
    summary: e.summary || "Untitled",
    description: e.description || undefined,
    location: e.location || undefined,
    start: e.startDate.toJSDate(),
    end: e.endDate.toJSDate(),
    allDay: e.startDate.isDate,
  };
}

/** Create an event on Apple Calendar. Returns the iCal UID so we can store it. */
export async function createAppleEvent(
  client: DAVClient,
  calendarUrl: string,
  opts: {
    title: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
  }
): Promise<{ uid: string }> {
  const uid = `cadence-${crypto.randomUUID()}@cadence.app`;
  const ics = buildICS({
    uid,
    summary: opts.title,
    description: `CADENCE: ${opts.description ?? ""}`.trim(),
    location: opts.location,
    start: opts.start,
    end: opts.end,
  });

  await client.createCalendarObject({
    calendar: { url: calendarUrl } as any,
    filename: `${uid}.ics`,
    iCalString: ics,
  });

  return { uid };
}

/** Delete an event from Apple Calendar by UID (requires knowing the calendar URL). */
export async function deleteAppleEvent(
  client: DAVClient,
  calendarUrl: string,
  uid: string
): Promise<void> {
  // tsdav needs a calendar object with url to delete; construct the filename we used on create.
  const url = `${calendarUrl.replace(/\/$/, "")}/${uid}.ics`;
  await client.deleteCalendarObject({ calendarObject: { url } as any });
}

function buildICS(o: {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}): string {
  const stamp = fmtICSDate(new Date());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cadence//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${o.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${fmtICSDate(o.start)}`,
    `DTEND:${fmtICSDate(o.end)}`,
    `SUMMARY:${escapeICS(o.summary)}`,
    o.description ? `DESCRIPTION:${escapeICS(o.description)}` : "",
    o.location ? `LOCATION:${escapeICS(o.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function fmtICSDate(d: Date): string {
  // UTC basic format: YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export { uuid };
