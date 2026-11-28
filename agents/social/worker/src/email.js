import { getQueueDay } from './github.js';
import { getLog } from './state.js';
import { addDays, formatEastern } from './time.js';
import { escapeHtml } from './util.js';

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
    `<p>The poster hit problems on ${date} (US Eastern):</p>
     <ul>${problems.map((problem) => `<li>${escapeHtml(problem)}</li>`).join('')}</ul>
     <p>Nothing is retried automatically, and a post that already went out is never posted again.</p>`,
  );

const snippet = (text = '', length = 140) => escapeHtml(text.length > length ? `${text.slice(0, length)}…` : text);

const eventRow = (date, event) =>
  `<tr><td>${date}</td><td>${escapeHtml(event.at ? formatEastern(event.at) : '')}</td><td>${escapeHtml(event.post ?? '')}</td>` +
  `<td>${escapeHtml(event.platform ?? '')}</td><td>${escapeHtml(event.status)}</td><td>${snippet(event.detail)}</td></tr>`;

const table = (rows) =>
  rows.length ? `<table cellpadding="4" border="1" style="border-collapse:collapse">${rows.join('')}</table>` : '<p>None.</p>';

async function queueLines(env, date) {
  try {
    const day = await getQueueDay(env, date);
    if (!day) return [`<li><strong>${date}</strong>: <em>no queue file yet</em></li>`];
    if (!day.posts.length) return [`<li><strong>${date}</strong>: no posts${day.note ? ` (${escapeHtml(day.note)})` : ''}</li>`];
    return day.posts.map(
      (post) =>
        `<li><strong>${date}</strong> ${escapeHtml(post.type)}${post.cta ? ' (CTA)' : ''}: ${snippet(post.card?.headline ?? post.linkedin, 80)}<br>` +
        `Facebook ${escapeHtml(formatEastern(Date.parse(post.schedule.facebook)))} · LinkedIn ${escapeHtml(formatEastern(Date.parse(post.schedule.linkedin)))}</li>`,
    );
  } catch (error) {
    return [`<li><strong>${date}</strong>: <em>${escapeHtml(error.message)}</em></li>`];
  }
}

/** Monday digest: the last 7 days (dry runs included), failures, and the next 7 days with scheduled times. */
export async function sendDigest(env, kv, today) {
  const pastDates = Array.from({ length: 7 }, (_, index) => addDays(today, index - 7));
  const logs = await Promise.all(pastDates.map(async (date) => [date, await getLog(kv, date)]));
  const rows = logs.flatMap(([date, events]) => events.map((event) => eventRow(date, event)));
  const failures = logs.flatMap(([date, events]) =>
    events.filter((event) => ['failed', 'missing', 'error'].includes(event.status)).map((event) => eventRow(date, event)),
  );
  const nextDates = Array.from({ length: 7 }, (_, index) => addDays(today, index));
  const queue = (await Promise.all(nextDates.map((date) => queueLines(env, date)))).flat();

  await sendEmail(
    env,
    `[nukt-social] Weekly digest ${today}`,
    `<h2>Last 7 days</h2>${table(rows)}
     <h2>Failures</h2>${table(failures)}
     <h2>Scheduled for the next 7 days (US Eastern)</h2><ul>${queue.join('')}</ul>
     <p>Days after today usually show "no queue file yet": each weekday's run writes that day (Friday also writes the weekend).</p>`,
  );
}
