/**
 * Minimal frontmatter reader for blog posts: `key: value` lines between `---`
 * fences. Shared by the Vite blog plugin (Node) and the browser bundle.
 */
const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const unquote = (value) => {
  const trimmed = value.trim();
  const quoted = /^(["'])(.*)\1$/.exec(trimmed);
  return quoted ? quoted[2] : trimmed;
};

export function parseFrontmatter(source) {
  const match = FENCE.exec(source);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    data[line.slice(0, separator).trim()] = unquote(line.slice(separator + 1));
  }

  return { data, body: source.slice(match[0].length) };
}

export const stripFrontmatter = (source) => parseFrontmatter(source).body;
