/**
 * Renders the 1080x1080 brand card for one or more queue entries with local
 * headless Chrome/Edge (free, no extra dependencies).
 *
 *   node agents/social/render-card.mjs agents/social/queue/2026-12-01.json [...more.json]
 *
 * Each entry needs `date` and `card: { kicker, headline }`. The PNG is written
 * to agents/social/images/<date>.png (the entry's `image` path).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const IMAGES_DIR = join(ROOT, 'agents/social/images');
const LOGO = pathToFileURL(join(ROOT, 'public/brand/nukt-logo-horizontal-light.svg')).href;
const SIZE = 1080;
const MAX_HEADLINE = 90;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Longer headlines get a smaller size so every card keeps the same margins.
const headlineSize = (text) => (text.length <= 36 ? 104 : text.length <= 60 ? 86 : 70);

const cardHtml = ({ kicker, headline }) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; background: #0E0E10; }
  body { position: relative; padding: 88px; font-family: "Space Grotesk", system-ui, sans-serif; color: #fff;
    display: flex; flex-direction: column; justify-content: space-between; }
  body::before { content: ""; position: absolute; inset: 0;
    background: radial-gradient(circle at 100% 0%, rgba(228,49,43,.22), transparent 45%),
                radial-gradient(circle at 0% 100%, rgba(255,255,255,.05), transparent 40%); }
  header, main, footer { position: relative; }
  header { display: flex; justify-content: space-between; align-items: center; }
  .logo { height: 44px; width: auto; }
  .kicker { display: inline-flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 500;
    letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.72); }
  .kicker::before { content: ""; width: 14px; height: 14px; border-radius: 50%; background: #E4312B; }
  h1 { font-weight: 600; letter-spacing: -0.045em; line-height: 1.02; max-width: 880px; }
  .bar { width: 120px; height: 8px; background: #E4312B; border-radius: 4px; margin-bottom: 48px; }
  footer { display: flex; justify-content: space-between; font-size: 26px; color: rgba(255,255,255,.6); }
</style></head>
<body>
  <header><img class="logo" src="${LOGO}" alt=""><span class="kicker">${escapeHtml(kicker)}</span></header>
  <main><div class="bar"></div><h1 style="font-size:${headlineSize(headline)}px">${escapeHtml(headline)}</h1></main>
  <footer><span>nukt.agency</span><span>Web · SEO · AI search</span></footer>
</body></html>`;

function findBrowser() {
  const browser = CHROME_CANDIDATES.find((path) => existsSync(path));
  if (!browser) throw new Error('Chrome or Edge not found. Set CHROME_PATH.');
  return browser;
}

function renderEntry(browser, entryPath) {
  const entry = JSON.parse(readFileSync(entryPath, 'utf8'));
  const { date, card } = entry;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) throw new Error(`${entryPath}: invalid date`);
  if (!card?.headline || !card?.kicker) throw new Error(`${entryPath}: card.kicker and card.headline are required`);
  if (card.headline.length > MAX_HEADLINE) throw new Error(`${entryPath}: headline over ${MAX_HEADLINE} characters`);

  // A fresh profile per render avoids Chrome's profile lock failing silently.
  const workDir = mkdtempSync(join(tmpdir(), 'nukt-card-'));
  const htmlPath = join(workDir, 'card.html');
  const output = join(IMAGES_DIR, `${date}.png`);
  writeFileSync(htmlPath, cardHtml(card));

  try {
    execFileSync(browser, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--allow-file-access-from-files', `--user-data-dir=${join(workDir, 'profile')}`,
      `--window-size=${SIZE},${SIZE}`, '--virtual-time-budget=8000',
      `--screenshot=${output}`, pathToFileURL(htmlPath).href,
    ], { stdio: 'ignore', timeout: 60_000 });
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }

  if (!existsSync(output) || statSync(output).size < 10_000) throw new Error(`${entryPath}: render failed`);
  console.log(`card ${date} → agents/social/images/${date}.png`);
}

const entries = process.argv.slice(2);
if (!entries.length) {
  console.error('Usage: node agents/social/render-card.mjs <queue-entry.json> [...]');
  process.exit(1);
}

const browser = findBrowser();
let failed = 0;
for (const entryPath of entries) {
  try {
    renderEntry(browser, resolve(entryPath));
  } catch (error) {
    failed += 1;
    console.error(error.message);
  }
}
process.exit(failed ? 1 : 0);
