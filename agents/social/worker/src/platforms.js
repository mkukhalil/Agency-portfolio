import { getImage, imageName } from './github.js';
import { composeText, withUtm } from './util.js';

/** Final post text for a platform, with its UTM-tagged link. */
export const textFor = (post, platform, date) =>
  composeText(post[platform], post.link ? withUtm(post.link, platform, date) : null);

/** Facebook Page photo post (image upload + caption) via the Graph API. */
async function postFacebook(env, post, { date }) {
  const name = imageName(post);
  const form = new FormData();
  form.append('message', textFor(post, 'facebook', date));
  form.append('published', 'true');
  form.append('access_token', env.FB_PAGE_TOKEN);
  form.append('source', new Blob([await getImage(env, name)], { type: 'image/png' }), name);

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
async function postLinkedIn(env, post, { date, imageUrl }) {
  const response = await fetch(env.MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, id: post.id, text: textFor(post, 'linkedin', date), imageUrl }),
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
