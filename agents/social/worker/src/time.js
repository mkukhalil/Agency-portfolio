/**
 * US Eastern time helpers (DST-aware through Intl). Shared by the Worker and
 * the laptop scripts, so scheduling and posting agree on what a time means.
 */
export const EASTERN = 'America/New_York';
export const POST_WINDOW = { start: 8 * 60, end: 18 * 60 }; // minutes after local midnight

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EASTERN,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** Eastern calendar date and wall-clock time for a UTC timestamp. */
export function easternParts(ms) {
  const parts = Object.fromEntries(formatter.formatToParts(new Date(ms)).map((part) => [part.type, part.value]));
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour, minute, minutes: hour * 60 + minute };
}

export const easternDate = (ms) => easternParts(ms).date;

const wallAsUtc = (date, minutes) => {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
};

/** UTC timestamp for an Eastern wall-clock time (minutes after midnight) on a date. */
export function easternToUtc(date, minutes) {
  const target = wallAsUtc(date, minutes);
  let guess = target + 5 * 3_600_000; // Eastern is UTC-5 or UTC-4
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = easternParts(guess);
    guess += target - wallAsUtc(actual.date, actual.minutes);
  }
  return guess;
}

/** "Thu Dec 4, 9:47 AM ET" style label for digests and logs. */
export function formatEastern(ms) {
  return `${new Date(ms).toLocaleString('en-US', {
    timeZone: EASTERN,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} ET`;
}

export const weekdayOf = (date) => new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 = Sunday

export const addDays = (date, days) =>
  new Date(Date.parse(`${date}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/** ISO 8601 week of a date, e.g. "2026-W50" (weeks start Monday; week 1 holds the first Thursday). */
export function isoWeek(date) {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 3 - ((day.getUTCDay() + 6) % 7)); // Thursday of this week
  const year = day.getUTCFullYear();
  const week = 1 + Math.floor((day - Date.UTC(year, 0, 1, 12)) / (7 * 86_400_000));
  return `${year}-W${String(week).padStart(2, '0')}`;
}
