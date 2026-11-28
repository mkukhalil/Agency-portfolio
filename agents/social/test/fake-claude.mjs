/**
 * Stand-in for `claude -p` used by run-daily-e2e.ps1. Reads the prompt from
 * stdin, writes one tip post for each date in the Run context, and a blog post
 * when the Run context says one is required.
 *
 * FAKE_MODE: ok (good blog) | badblog (blog too short) | limit (usage limit, partial file)
 */
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { blogSource } from './blog-fixture.mjs';

const prompt = readFileSync(0, 'utf8');
const today = prompt.match(/^- Today: (\d{4}-\d{2}-\d{2})/m)[1];
const dates = [...prompt.matchAll(/^- (\d{4}-\d{2}-\d{2}) \(\w+day\)/gm)].map((match) => match[1]);
const blogRequired = /Weekly blog post: REQUIRED today/.test(prompt);
const mode = process.env.FAKE_MODE ?? 'ok';

if (mode === 'limit') {
  writeFileSync(`agents/social/queue/${today}.json`, '{"partial": true}');
  console.log(JSON.stringify({ type: 'result', subtype: 'error_during_execution', is_error: true, result: 'Claude AI usage limit reached' }));
  process.exit(1);
}

const sample = JSON.parse(readFileSync('agents/social/worker/test/fixtures/queue/sample-tip.json', 'utf8'));
for (const date of dates) {
  const post = {
    ...sample,
    id: `${date}-1`,
    link: null,
    linkedin: sample.linkedin.replace(/\s*Full walkthrough: \{link\}/, ''),
    facebook: sample.facebook.replace(/\s*More here: \{link\}/, ''),
    image: `agents/social/images/${date}-1.png`,
  };
  copyFileSync('agents/social/worker/test/fixtures/images/sample.png', post.image);
  writeFileSync(`agents/social/queue/${date}.json`, JSON.stringify({ date, posts: [post] }, null, 2));
}

if (blogRequired) {
  writeFileSync(`src/content/blog/e2e-blog-${today}.md`, blogSource(today, mode === 'badblog' ? 200 : 900));
}

console.log(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, result: `Wrote ${dates.length} day(s)${blogRequired ? ' and a blog post' : ''}.` }));
