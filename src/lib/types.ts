export type Priority = 1 | 2 | 3;
export type TaskStatus = "INBOX" | "SCHEDULED" | "DONE" | "SKIPPED";
export type Energy = "DEEP" | "LIGHT" | "ADMIN";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  priority: Priority;
  status: TaskStatus;
  energy: Energy | null;
  category_id: string | null;
  estimated_minutes: number;
  scheduled_start: string | null;
  scheduled_end: string | null;
  due_date: string | null;
  must_do_today: boolean;
  completed_at: string | null;
  rolled_from_date: string | null;
  external_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  account_id: string | null;
  external_uid: string | null;
  calendar_name: string | null;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  source: "apple" | "cadence";
  linked_task_id: string | null;
  etag: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarAccount {
  id: string;
  user_id: string;
  provider: "apple";
  display_name: string;
  username: string;
  password_ciphertext: string;
  caldav_url: string;
  sync_token: string | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  timezone: string;
  work_hours_start: string;
  work_hours_end: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  plan_time: string;
  shutdown_time: string;
}

export interface FreeWindow {
  start: Date;
  end: Date;
  minutes: number;
}
