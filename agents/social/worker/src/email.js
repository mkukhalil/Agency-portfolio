import { getQueueEntry } from './github.js';
import { getLog } from './state.js';
import { addDays, escapeHtml } from './util.js';

/** Sends through Resend; throws so callers can log a delivery failure. */
export async function sendEmail(env, subject, html) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.ALERT_FROM || 'Nukt Social <onboarding@resend.dev>',
      to: [env.ALERT_EMAIL],
      subject,
      html,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 200)}`);
}

export const sendAlert = (env, date, problems) =>
  sendEmail(
    env,
    `[nukt-social] ${problems.length} problem(s) on ${date}`,
    `<p>The daily poster hit problems on ${date}:</p>
     <ul>${problems.map((problem) => `<li>${escapeHtml(problem)}</li>`).join('')}</ul>
     <p>Nothing is retried automatically, and a platform that already posted is never posted to again.</p>`,
  );

const snippet = (text = '', length = 160) => escapeHtml(text.length > length ? `${text.slice(0, length)}…` : text);

const eventRow = (date, event) =>
  `<tr><td>${date}</td><td>${escapeHtml(event.platform ?? '')}</td><td>${escapeHtml(event.status)}</td><td>${snippet(event.detail)}</td></tr>`;

const table = (rows) =>
  rows.length ? `<table cellpadding="4" border="1" style="border-collapse:collapse">${rows.join('')}</table>` : '<p>None.</p>';

async function queueLine(env, date) {
  try {
    const entry = await getQueueEntry(env, date);
    if (!entry) return `<li><strong>${date}</strong>: <em>missing</em></li>`;
    const label = `${escapeHtml(entry.type ?? 'post')}${entry.cta ? ', CTA' : ''}`;
    return `<li><strong>${date}</strong> (${label}): ${snippet(entry.linkedin)}</li>`;
  } catch (error) {
    return `<li><strong>${date}</strong>: <em>${escapeHtml(error.message)}</em></li>`;
  }
}

/** Monday digest: the last 7 days of activity (dry runs included), failures, and the next 8 days of queue. */
export async function sendDigest(env, kv, today) {
  const pastDates = Array.from({ length: 7 }, (_, index) => addDays(today, index - 7));
  const logs = await Promise.all(pastDates.map(async (date) => [date, await getLog(kv, date)]));
  const rows = logs.flatMap(([date, events]) => events.map((event) => eventRow(date, event)));
  const failures = logs.flatMap(([date, events]) =>
    events.filter((event) => ['failed', 'missing', 'error'].includes(event.status)).map((event) => eventRow(date, event)),
  );
  const queue = await Promise.all(Array.from({ length: 8 }, (_, index) => queueLine(env, addDays(today, index))));

  await sendEmail(
    env,
    `[nukt-social] Weekly digest ${today}`,
    `<h2>Last 7 days</h2>${table(rows)}
     <h2>Failures</h2>${table(failures)}
     <h2>Queue for the next 8 days</h2><ul>${queue.join('')}</ul>`,
  );
}
