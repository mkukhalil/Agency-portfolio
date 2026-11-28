export const PLATFORMS = ['facebook', 'linkedin'];

/** Adds the campaign tags every outbound link carries. */
export function withUtm(link, platform, date) {
  const url = new URL(link);
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', date);
  return url.toString();
}

/** Puts the tagged link where the post has {link}, or appends it. */
export function composeText(text, link) {
  if (!link) return text.replace(/\s*\{link\}\s*/g, '\n\n').trim();
  return text.includes('{link}') ? text.replaceAll('{link}', link) : `${text.trim()}\n\n${link}`;
}

const toHex = (buffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

export async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

export const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
