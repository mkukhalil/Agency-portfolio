import { getImage } from './github.js';
import { composeText, withUtm } from './util.js';

/** Final post text for a platform, with its UTM-tagged link. */
export const textFor = (entry, platform) =>
  composeText(entry[platform], entry.link ? withUtm(entry.link, platform, entry.date) : null);

/** Facebook Page photo post (image upload + caption) via the Graph API. */
async function postFacebook(env, entry) {
  const form = new FormData();
  form.append('message', textFor(entry, 'facebook'));
  form.append('published', 'true');
  form.append('access_token', env.FB_PAGE_TOKEN);
  form.append('source', new Blob([await getImage(env, entry.image)], { type: 'image/png' }), `${entry.date}.png`);

  const version = env.GRAPH_API_VERSION || 'v21.0';
  const response = await fetch(`https://graph.facebook.com/${version}/${env.FB_PAGE_ID}/photos`, {
    method: 'POST',
    body: form,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.error) throw new Error(`Facebook: ${result.error?.message || response.status}`);
  return result.post_id || result.id;
}

/**
 * LinkedIn company post through a Make.com scenario. The scenario must end
 * with a Webhook response of {"ok": true}, so a failed LinkedIn step surfaces here.
 */
async function postLinkedIn(env, entry, { imageUrl }) {
  const response = await fetch(env.MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: entry.date, text: textFor(entry, 'linkedin'), imageUrl }),
  });
  const body = await response.text();
  let result = {};
  try {
    result = JSON.parse(body);
  } catch {
    // Make replies "Accepted" when the scenario lacks a Webhook response module.
  }

  if (!response.ok || result.ok !== true) {
    throw new Error(`LinkedIn via Make: ${response.status} ${body.slice(0, 200)}`);
  }
  return result.id || 'ok';
}

export const publishers = { facebook: postFacebook, linkedin: postLinkedIn };
