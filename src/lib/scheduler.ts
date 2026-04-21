// Cadence auto-scheduler — rules-based (MVP).
// Sort tasks by: mustDoToday DESC, priority ASC (P1 first), dueDate ASC, estimatedMinutes ASC.
// Fit into free windows between calendar events, inside work hours, outside quiet hours, with a buffer.

import type { Task, CalendarEvent, Profile, FreeWindow } from "./types";
import { addMinutes, hhmmToDate, minutesBetween } from "./utils";

const BUFFER_MIN = 10;

export interface ScheduleInput {
  date: Date;
  profile: Profile;
  events: CalendarEvent[];
  tasks: Task[]; // only plannable: unscheduled or already scheduled to this date
}

export interface ScheduleAssignment {
  taskId: string;
  start: Date;
  end: Date;
}

export interface ScheduleResult {
  assignments: ScheduleAssignment[];
  unscheduled: string[]; // task ids that didn't fit
  windows: FreeWindow[]; // for UI debugging
}

export function computeFreeWindows(
  date: Date,
  profile: Profile,
  events: CalendarEvent[]
): FreeWindow[] {
  const dayStart = hhmmToDate(date, profile.work_hours_start);
  const dayEnd = hhmmToDate(date, profile.work_hours_end);

  // Block quiet hours (overnight ranges handled): treat quiet as a single block if it falls inside work hours.
  const busy: { start: Date; end: Date }[] = [];

  const quietStart = hhmmToDate(date, profile.quiet_hours_start);
  const quietEnd = hhmmToDate(date, profile.quiet_hours_end);
  if (quietEnd > quietStart) {
    busy.push({ start: quietStart, end: quietEnd });
  } else {
    // overnight — clip the tail at dayEnd and head at dayStart
    busy.push({ start: quietStart, end: dayEnd });
    busy.push({ start: dayStart, end: quietEnd });
  }

  for (const e of events) {
    const s = new Date(e.starts_at);
    const en = new Date(e.ends_at);
    if (en <= dayStart || s >= dayEnd) continue;
    busy.push({
      start: s < dayStart ? dayStart : s,
      end: en > dayEnd ? dayEnd : en,
    });
  }

  // merge overlapping
  const merged = mergeIntervals(busy);

  // invert to get free windows inside [dayStart, dayEnd]
  const free: FreeWindow[] = [];
  let cursor = new Date(dayStart);
  for (const b of merged) {
    if (b.start > cursor) {
      const start = addMinutes(cursor, BUFFER_MIN);
      const end = addMinutes(b.start, -BUFFER_MIN);
      if (end > start) free.push({ start, end, minutes: minutesBetween(start, end) });
    }
    if (b.end > cursor) cursor = b.end;
  }
  if (cursor < dayEnd) {
    const start = addMinutes(cursor, BUFFER_MIN);
    if (dayEnd > start)
      free.push({ start, end: dayEnd, minutes: minutesBetween(start, dayEnd) });
  }
  return free.filter((w) => w.minutes >= 15);
}

function mergeIntervals(
  xs: { start: Date; end: Date }[]
): { start: Date; end: Date }[] {
  if (!xs.length) return [];
  const sorted = [...xs].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    if (sorted[i].start <= last.end) {
      if (sorted[i].end > last.end) last.end = sorted[i].end;
    } else {
      out.push(sorted[i]);
    }
  }
  return out;
}

export function planDay(input: ScheduleInput): ScheduleResult {
  const windows = computeFreeWindows(input.date, input.profile, input.events);

  const sorted = [...input.tasks].sort((a, b) => {
    if (a.must_do_today !== b.must_do_today) return a.must_do_today ? -1 : 1;
    if (a.priority !== b.priority) return a.priority - b.priority;
    const ad = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
    const bd = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
    if (ad !== bd) return ad - bd;
    return a.estimated_minutes - b.estimated_minutes;
  });

  // Working copy of windows — shrink them as we place tasks.
  const work = windows.map((w) => ({ ...w }));
  const assignments: ScheduleAssignment[] = [];
  const unscheduled: string[] = [];

  for (const task of sorted) {
    const fit = work.find((w) => w.minutes >= task.estimated_minutes);
    if (!fit) {
      unscheduled.push(task.id);
      continue;
    }
    const start = new Date(fit.start);
    const end = addMinutes(start, task.estimated_minutes);
    assignments.push({ taskId: task.id, start, end });
    // shrink the window
    fit.start = addMinutes(end, BUFFER_MIN);
    fit.minutes = minutesBetween(fit.start, fit.end);
  }

  return { assignments, unscheduled, windows };
}
