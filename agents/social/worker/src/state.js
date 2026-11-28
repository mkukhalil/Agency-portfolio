import { addDays } from './util.js';

const LOG_TTL_SECONDS = 60 * 86_400;
export const DRY_RUN_DAYS = 3;

/** Kill switch: posting runs only while KV "enabled" is exactly "true". */
export const isEnabled = async (kv) => (await kv.get('enabled')) === 'true';

/**
 * The first enabled run starts the clock; the first DRY_RUN_DAYS calendar
 * days only log what would be posted. "force_dry_run" = "true" keeps it dry.
 */
export async function isDryRun(kv, date) {
  if ((await kv.get('force_dry_run')) === 'true') return true;

  let firstRun = await kv.get('first_run');
  if (!firstRun) {
    firstRun = date;
    await kv.put('first_run', date);
  }
  return date < addDays(firstRun, DRY_RUN_DAYS);
}

const postedKey = (date, platform) => `posted:${date}:${platform}`;

export const getPosted = (kv, date, platform) => kv.get(postedKey(date, platform), 'json');

export const markPosted = (kv, date, platform, record) => kv.put(postedKey(date, platform), JSON.stringify(record));

export const getLog = async (kv, date) => (await kv.get(`log:${date}`, 'json')) ?? [];

export async function appendLog(kv, date, events) {
  if (!events.length) return;
  const existing = await getLog(kv, date);
  await kv.put(`log:${date}`, JSON.stringify([...existing, ...events]), { expirationTtl: LOG_TTL_SECONDS });
}
