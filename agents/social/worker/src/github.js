/** Reads queue day files and images from the repo with a fine-grained read-only token. */
const API = 'https://api.github.com';
export const IMAGE_NAME = /^\d{4}-\d{2}-\d{2}-[12]\.png$/;

async function getRaw(env, path) {
  const ref = encodeURIComponent(env.GITHUB_BRANCH || 'main');
  const response = await fetch(`${API}/repos/${env.GITHUB_REPO}/contents/${path}?ref=${ref}`, {
    headers: {
      Accept: 'application/vnd.github.raw+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'nukt-social-worker',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub ${response.status} for ${path}`);
  return response;
}

/** The day's queue file, or null when the daily run has not produced one. */
export async function getQueueDay(env, date) {
  const response = await getRaw(env, `agents/social/queue/${date}.json`);
  if (!response) return null;

  const day = await response.json();
  if (day.date !== date || !Array.isArray(day.posts)) throw new Error(`Queue file ${date}.json is malformed`);
  for (const post of day.posts) {
    if (!post.id || !post.linkedin || !post.facebook || !post.image || !post.schedule?.facebook || !post.schedule?.linkedin) {
      throw new Error(`Queue post ${post.id ?? '?'} on ${date} is missing text, image or schedule`);
    }
  }
  return day;
}

export async function getImage(env, name) {
  if (!IMAGE_NAME.test(name)) throw new Error(`Unexpected image name ${name}`);
  const response = await getRaw(env, `agents/social/images/${name}`);
  if (!response) throw new Error(`Image not found: ${name}`);
  return response.arrayBuffer();
}

export const imageName = (post) => post.image.split('/').pop();
