/** Reads queue entries and images from the repo with a fine-grained read-only token. */
const API = 'https://api.github.com';
const IMAGE_PATH = /^agents\/social\/images\/\d{4}-\d{2}-\d{2}\.png$/;

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

/** Today's queue entry, or null when there is none. */
export async function getQueueEntry(env, date) {
  const response = await getRaw(env, `agents/social/queue/${date}.json`);
  if (!response) return null;

  const entry = await response.json();
  if (entry.date !== date) throw new Error(`Queue file ${date}.json has date ${entry.date}`);
  if (!entry.linkedin || !entry.facebook || !entry.image) {
    throw new Error(`Queue entry ${date} is missing linkedin, facebook or image`);
  }
  return entry;
}

export async function getImage(env, imagePath) {
  if (!IMAGE_PATH.test(imagePath)) throw new Error(`Unexpected image path ${imagePath}`);
  const response = await getRaw(env, imagePath);
  if (!response) throw new Error(`Image not found: ${imagePath}`);
  return response.arrayBuffer();
}
