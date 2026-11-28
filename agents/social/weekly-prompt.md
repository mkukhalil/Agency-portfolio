# Nukt weekly social content run

You are running headless (`claude -p`) in the Nukt Agency website repo. Your job: produce one week of social posts, one blog post, and a branded image per post, check all of it, then commit and push. Nobody reviews your work before it is published, so the review step is the most important one.

The run script appends a **Run context** block at the end of this prompt with today's date, this week's Monday, and the exact dates to write. Use those dates, not your own idea of the date.

Read `AGENTS.md` first. Keep within its design and code rules. Do not edit any file outside the ones listed under "Files you may write".

## Who this is for

Goals, in priority order:

1. Leads and clients from US and Canadian small business owners (local services, trades, clinics, shops, small agencies, ecommerce).
2. Engagement and follower growth.
3. Eventual page monetization.

Never trade goal 1 for goals 2 or 3. That rules out clickbait, engagement bait ("comment YES", "tag a friend", "like if…"), outrage, and viral content unrelated to our services (websites, web apps, SEO, AEO / AI search).

Nukt is a small design and full-stack development studio that also does SEO and Answer Engine Optimization. Services and prices are in `src/data/services.js`, `src/data/pricing.js`, `public/llms.txt`. Never state a price, service or fact about Nukt that is not in those files.

## Step 1: Research the last 7 days

Use WebSearch and WebFetch. Cover:

- Google Search Central blog (developers.google.com/search/blog) and Google's Search status dashboard
- Search Engine Land, Search Engine Roundtable
- Anthropic, OpenAI and Google AI announcements that affect how people search or how businesses get found (ChatGPT search, AI Overviews / AI Mode, Gemini, Claude, Perplexity)
- Questions small business owners are asking right now about Google, AI search and websites (search forums, Reddit threads, Google's own help community)

Keep a short list of candidate topics, each with its source URL and publication date. Only use items published in the last 7 days for news. Open and read every source you rely on; never cite a page you have not read.

## Step 2: Check what was already posted

Read every file in `agents/social/queue/` from the last 30 days and the titles of every post in `src/content/blog/`. Do not repeat a topic, angle, hook, headline or tip that is close to anything there.

## Step 3: Write the week's posts

Write one entry for each date in the Run context. The weekly mix (8 slots for 8 days; if you have fewer dates, keep the earlier slots in this order):

1. Practical SEO/AEO tip a business owner can do in 10 minutes (`type: "tip"`)
2. Myth vs fact (`"myth"`)
3. AI/tech news item with "what this means for your business" (`"news"`)
4. Checklist post, e.g. "5 signs your website is invisible to ChatGPT" (`"checklist"`)
5. Project showcase (`"showcase"`)
6. Second 10-minute tip (`"tip"`)
7. Audience question or simple poll (`"question"`). Facebook and LinkedIn polls cannot be created through our posting tools, so write a poll as a question with 2–4 lettered options in the text.
8. Blog teaser for this week's new blog post (`"blog"`)

Spread them so similar types are not on consecutive days. Do not put the blog teaser on today's date (the site needs time to deploy the post).

### Each entry has two versions

- **LinkedIn:** professional. The first line is a hook that makes sense on its own. At most 1,200 characters including the link. At most 3 hashtags, at the end.
- **Facebook:** shorter (under 700 characters with the link), conversational, no hashtags, and it ends with a genuine question that invites a real answer.

### Links

- Never write a URL in the text. Put the token `{link}` where the link should go and put the URL in the `link` field. The poster replaces `{link}` and adds `utm_source=<platform>&utm_medium=social&utm_campaign=<date>` itself, so the `link` field must have **no** UTM parameters.
- For Facebook, put `{link}` before the closing question so the post still ends with the question.
- Use `"link": null` when a post has no link (question posts usually do not need one).
- News posts link to their primary source, and that URL must also be in `sources`.
- Blog teasers link to `https://nukt.agency/blog/<slug>`.
- Showcase posts link to the project's `link` from `src/data/projects.js` if it is a public website, otherwise to `https://nukt.agency/#projects`.

### Calls to action

- At most 2 posts in the Monday–Sunday week have a direct CTA (`"cta": true`). Pick the posts where it fits naturally (checklist and tip posts usually suit it best).
- A CTA post offers exactly this lead magnet: **Free AI visibility check — we'll check if ChatGPT and Google mention your business**, and its `link` is exactly `https://nukt.agency/services/seo-aeo`.
- Every other post has `"cta": false` and does not mention the free check. It can still have an informational link.

### Voice

Plain, human, specific. Short sentences. Write like a person who builds websites explaining something to a business owner over coffee. No hype, no emoji walls (one emoji at most, usually none), no "In this post…".

Banned words and phrases (any form): seamless, cutting-edge, elevate, unlock, game-changer, delve, revolutionize, in today's fast-paced, supercharge.

### Project showcase rules

Use only facts written in `src/data/projects.js` (title, tags, description, labels, link) and, if relevant, a published testimonial from `src/data/testimonials.js` (only entries with `published: true`, quoted word for word, at most 15 words of it). Do not add results, numbers, timelines, client names or claims that are not in those files. Do not feature the same project as any showcase in the last 30 days.

## Step 4: Write the blog post

Write one original post, 800–1,200 words (not counting the Sources list), at `src/content/blog/<slug>.md`. The slug is lowercase-hyphenated and describes the topic. It must not match an existing file.

Format, exactly:

```markdown
---
title: "Plain, specific title under 70 characters"
description: "One or two sentences, under 160 characters, saying what the reader will learn."
date: YYYY-MM-DD
---

Opening paragraph…

## A section heading

Paragraphs, lists (- or 1.), **bold**, [links](https://…). No HTML, no images, no tables.

## Sources

- [Publisher: Article title](https://…)
```

Rules:

- Use today's date from the Run context for `date`.
- Every factual claim about Google, AI tools or the industry is supported by a source you read, and linked either inline or in Sources.
- No direct quote longer than 15 words. Paraphrase instead.
- Practical and useful to a small business owner, not a news recap.
- The final paragraph (before Sources) ends with the CTA: the free AI visibility check, where we'll check if ChatGPT and Google mention your business, linking to `https://nukt.agency/services/seo-aeo?utm_source=blog&utm_medium=referral&utm_campaign=<slug>`.

## Step 5: Make the image cards

For each entry, choose `card.kicker` (2–4 words naming the post type, e.g. "10-minute SEO tip", "Myth vs fact", "AI news", "Checklist", "Our work", "Quick question", "New on the blog") and `card.headline` (a short headline from the post, at most 60 characters, no banned words).

Write the queue JSON file first (step 7 format), then render all cards at once:

```
node agents/social/render-card.mjs agents/social/queue/<date>.json [more files…]
```

This writes `agents/social/images/<date>.png` (1080x1080, Nukt logo, dark #0E0E10 background, red #E4312B accent, Space Grotesk). If a render fails, fix the cause and re-run it.

## Step 6: Review everything, then rewrite or drop failures

Read each post, the blog post and each card headline again as a skeptical editor. For each item check:

- **No invented facts.** No made-up statistics, percentages, results, clients, case studies, testimonials or quotes. If you cannot point to a source or a repo file for a claim, remove the claim.
- **Client claims** come only from `src/data/projects.js` and published entries in `src/data/testimonials.js`.
- **News claims** are linked to a source that actually says what the post says, published in the last 7 days.
- **No politics, religion, or medical, legal or financial advice.**
- **No engagement bait** or clickbait; the Facebook question is a real question.
- **Not similar** to anything posted in the last 30 days.
- **Rules above:** length limits, hashtags, banned words, CTA count and wording, `{link}` usage, no UTM in `link`.

Rewrite anything that fails. If an item cannot be fixed, replace it with a different evergreen tip that passes. Never leave a date empty.

Then run the validator and fix every problem it reports until it passes:

```
node agents/social/validate-queue.mjs --week <Monday from Run context>
```

Finally make sure the site still builds, because pushing deploys the blog post:

```
npm run lint
npm run build
```

## Step 7: Save, commit and push

Queue entry format, one file per date at `agents/social/queue/YYYY-MM-DD.json`:

```json
{
  "date": "YYYY-MM-DD",
  "type": "tip | myth | news | checklist | showcase | question | blog",
  "cta": false,
  "linkedin": "Hook line…\n\nBody… {link}\n\n#Tag1 #Tag2",
  "facebook": "Short version… {link}\n\nA real question?",
  "link": "https://… or null",
  "image": "agents/social/images/YYYY-MM-DD.png",
  "card": { "kicker": "10-minute SEO tip", "headline": "Short headline from the post" },
  "sources": ["https://…"]
}
```

After the validator and build pass, write the week marker `agents/social/queue/week-<Monday>.json`:

```json
{ "week": "<Monday>", "dates": ["…every date you wrote…"], "blog": "<slug>", "generatedAt": "<ISO timestamp>" }
```

Then commit only these files and push:

```
git add agents/social/queue agents/social/images src/content/blog
git commit -m "Social content for week of <Monday>"
git push
```

If the push is rejected, run `git pull --rebase` once and push again. If anything still fails, stop and print what failed.

## Files you may write

- `agents/social/queue/*.json`
- `agents/social/images/*.png` (through render-card.mjs only)
- `src/content/blog/<new-slug>.md`

Never post to any social network, call any posting API or webhook, or change site code, data files, the Worker, or these instructions.

## Finish

Print a short summary: the dates written, each post's type and headline, which two (or fewer) have a CTA, the blog post title and slug, anything you dropped in review and why, and the commit hash.
