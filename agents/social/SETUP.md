# nukt-social setup

Fully automatic social content and posting for Nukt, at $0 running cost.

```
Monday 12:30 PKT  Windows laptop ─ run-weekly.ps1 ─ claude -p weekly-prompt.md (path-scoped tools)
                  research → 8 days of posts + blog post + image cards → review → validator → build
                  → script guard (only content files changed) → script commits and git push  (queue/*.json, images/*.png, src/content/blog/*.md)
                                   │
Every day         Cloudflare Worker (cron 14:00 UTC)
14:00 UTC         reads today's queue entry + image from GitHub (read-only token)
                  ├─ Facebook Page  ← Graph API photo post (long-lived Page token)
                  └─ LinkedIn page  ← Make.com webhook → LinkedIn company image post
                  KV: posted dates (never twice), kill switch, logs
                  Resend: alert on any failure, digest every Monday
```

The first 3 days after you switch it on are a dry run: the Worker logs what it would post (you see it in the Monday digest) and then goes live by itself.

**About the $0:** Cloudflare Workers + KV, Make.com, Resend and the Meta Graph API are used within their free tiers (see [Free-tier limits](#free-tier-limits)). The weekly content run uses Claude Code with your existing Claude subscription; it does not use paid API credits unless you sign Claude Code in with an API key.

Contents:

1. [Weekly content run on your laptop](#1-weekly-content-run-on-your-laptop)
2. [GitHub read-only token](#2-github-read-only-token)
3. [Meta app and long-lived Page token](#3-meta-app-and-long-lived-page-token)
4. [Make.com scenario for LinkedIn](#4-makecom-scenario-for-linkedin)
5. [Resend for alert emails](#5-resend-for-alert-emails)
6. [Cloudflare Worker: secrets, deploy, switch on](#6-cloudflare-worker-secrets-deploy-switch-on)
7. [Testing locally](#7-testing-locally)
8. [How to pause, skip or fix things](#8-how-to-pause-skip-or-fix-things)

---

## 1. Weekly content run on your laptop

### 1.1 Install and sign in to Claude Code CLI

The desktop app does not put `claude` on your PATH, so install the CLI once:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Open a new PowerShell window, run `claude`, and sign in with your Claude account (choose the subscription login, not an API key). Type `/exit` when signed in.

Check that the run script can see it:

```powershell
powershell -ExecutionPolicy Bypass -File G:\Khalil\portfolio-new\agents\social\run-weekly.ps1 -Preview
```

It prints the dates it would write and `Claude CLI: C:\Users\…\claude.exe`. `-Preview` never calls Claude or touches git.

### 1.2 Make sure `git push` works without a prompt

The task runs unattended, so pushing must not ask for a passphrase. Your remote uses the SSH alias `github-mkukhalil`. Test from a fresh PowerShell window:

```powershell
git -C G:\Khalil\portfolio-new push --dry-run
```

If it asks for a passphrase, either start the Windows `ssh-agent` service (Services → OpenSSH Authentication Agent → Startup type: Automatic → Start) and run `ssh-add` once, or use a key without a passphrase for this repo.

Keep the working tree clean on `main`, including untracked files (for example the `nukt-logo/` folder and `nukt-logo.zip` in the repo root: move them out or delete them). The script refuses to start on a dirty tree, because its guard treats any change outside the content folders as a reason to abort.

### 1.3 Failure alerts from the laptop

The Worker's alerts cover daily posting. For the weekly run, the script emails you through Resend on any failure (including the guard blocking a push) if these two user environment variables exist. Set them once (use the Resend key from step 5):

```powershell
[Environment]::SetEnvironmentVariable('NUKT_RESEND_API_KEY', 'PASTE_KEY', 'User')
```

```powershell
[Environment]::SetEnvironmentVariable('NUKT_ALERT_EMAIL', 'you@example.com', 'User')
```

Without them, failures are only written to the log and to Task Scheduler's Last Run Result.

### 1.4 Task Scheduler

**Quick way:** run once from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File G:\Khalil\portfolio-new\agents\social\register-task.ps1
```

**Manual way (same result):**

1. Press Start, type **Task Scheduler**, open it.
2. Right panel → **Create Task…** (not "Create Basic Task").
3. **General** tab
   - Name: `nukt-social weekly`
   - Select **Run only when user is logged on** (Claude Code and your SSH key live in your user session).
   - Leave "Run with highest privileges" unchecked.
4. **Triggers** tab → **New…**
   - Begin the task: **On a schedule** → **Weekly**
   - Start: today's date, **12:30:00 PM** (your laptop is on PKT, so this is 12:30 PKT)
   - Recur every **1** weeks on: **Monday**
   - Enabled ✓ → OK
5. **Triggers** tab → **New…** again
   - Begin the task: **At log on** → Specific user: you
   - Advanced settings: **Delay task for: 5 minutes**
   - Enabled ✓ → OK

   Task Scheduler cannot limit a logon trigger to Monday–Friday, so the action passes `-WeekdaysOnly` and the script exits straight away on Saturday and Sunday. On weekdays it exits straight away if this week's posts already exist, so extra triggers never create duplicates.
6. **Actions** tab → **New…**
   - Action: **Start a program**
   - Program/script: `powershell.exe`
   - Add arguments:
     `-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "G:\Khalil\portfolio-new\agents\social\run-weekly.ps1" -WeekdaysOnly`
   - Start in: `G:\Khalil\portfolio-new`
7. **Conditions** tab
   - Uncheck **Start the task only if the computer is on AC power**.
   - Check **Start only if the following network connection is available: Any connection**.
8. **Settings** tab
   - ✓ **Allow task to be run on demand**
   - ✓ **Run task as soon as possible after a scheduled start is missed**
   - ✓ **Stop the task if it runs longer than: 2 hours**
   - If the task is already running: **Do not start a new instance**
9. OK.

To test it now: right-click the task → **Run**. Logs go to `agents\social\logs\weekly-<time>.log` (not committed). "Last Run Result" `0x0` means success or a clean skip; `0x1` means it failed, and the log says why.

### What a run does

- Skips if `agents/social/queue/week-<Monday>.json` exists.
- Writes posts for today through next Monday (the 8th day is a buffer in case next week's run is late). If today's file already exists from last week's buffer, it is kept.
- Runs Claude Code headless with a minimal tool list (no `--dangerously-skip-permissions`; anything unlisted is refused because headless mode cannot ask):
  - `WebSearch`, `WebFetch`
  - `Read` only in `src/content/blog/` and `agents/social/`
  - `Write`/`Edit` only in `src/content/blog/` and `agents/social/queue/`
  - shell only for `node agents/social/render-card.mjs`, `node agents/social/validate-queue.mjs` and `npm run build`

  Claude has no git access. The repo facts it may cite (services, pricing, projects, testimonials, llms.txt) and the last 30 days of posts are pasted into its prompt by the script.
- **Guard:** after Claude finishes, the script (not Claude) lists every changed, added, deleted and untracked file. Only `src/content/blog/<slug>.md`, `agents/social/queue/<name>.json` and `agents/social/images/<date>.png` may change, nothing may be deleted, and no commit may have been made. Anything else aborts the run with nothing committed or pushed, and sends the failure alert.
- The script then runs the validator and the build, commits only those folders, re-checks the commit's file list, and pushes. Any failure → exit code 1 and an alert.

To test the guard yourself: change any other file, then run `powershell -ExecutionPolicy Bypass -File agentssocialun-weekly.ps1 -GuardOnly`. It should block and list the file.
- Pushing to `main` also deploys the new blog post through Cloudflare Pages.

---

## 2. GitHub read-only token

The Worker reads the queue from the private repo.

1. GitHub → your avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Name `nukt-social-worker`, expiration up to 1 year (put a reminder in your calendar; when it expires the Worker emails you a GitHub 401 alert).
3. Repository access: **Only select repositories** → `mkukhalil/Agency-portfolio`.
4. Permissions → Repository permissions → **Contents: Read-only** (Metadata: Read-only is added automatically). Nothing else.
5. Generate, copy it. You will paste it into `wrangler secret put GITHUB_TOKEN` in step 6. Do not save it anywhere in the repo.

---

## 3. Meta app and long-lived Page token

You need the numeric **Page ID** and a **Page access token that never expires**.

### 3.1 Create the app

1. Go to <https://developers.facebook.com/apps> → **Create app**.
2. Use case: **Other** → app type **Business** → name it `Nukt Social` → create.
3. In the app dashboard → **App settings → Basic**: set **Privacy Policy URL** to `https://nukt.agency/privacy`, pick a category, save. Note the **App ID** and **App secret** (Show).
4. Switch the app from **Development** to **Live** at the top of the dashboard. (Posts made by an app in Development mode can be hidden from the public.) Because you only post to a Page you admin, the standard access level of the permissions below is enough; you do not need App Review for that.

### 3.2 Get a short-lived user token

1. Open the **Graph API Explorer**: <https://developers.facebook.com/tools/explorer/>.
2. Meta App: **Nukt Social**. User or Page: **Get User Access Token**.
3. Add permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`. Generate, and in the Facebook dialog choose the **Nukt** Page.
4. Copy the token shown (it lasts about an hour).

### 3.3 Exchange it for a long-lived user token

In PowerShell (replace the three values; this goes straight to Meta and nowhere else):

```powershell
$appId = 'APP_ID'; $appSecret = 'APP_SECRET'; $shortToken = 'SHORT_LIVED_USER_TOKEN'
$long = Invoke-RestMethod "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$appId&client_secret=$appSecret&fb_exchange_token=$shortToken"
$long.access_token
```

### 3.4 Get the Page token and Page ID

```powershell
$pages = Invoke-RestMethod "https://graph.facebook.com/v21.0/me/accounts?access_token=$($long.access_token)"
$pages.data | Select-Object name, id, access_token
```

The `access_token` next to the Nukt Page is a Page token derived from a long-lived user token, so it does not expire. The `id` is your `FB_PAGE_ID`.

### 3.5 Check it

Paste the Page token into the **Access Token Debugger** (<https://developers.facebook.com/tools/debug/accesstoken/>). It should say **Type: Page**, **Expires: Never**, and list `pages_manage_posts`.

The token stops working if you change your Facebook password, remove the app, or lose admin on the Page. The Worker emails you the Graph API error when that happens; redo 3.2–3.4 and update the secret.

---

## 4. Make.com scenario for LinkedIn

LinkedIn's API for company posts needs an approved developer app, so the Worker hands LinkedIn posts to a free Make.com scenario that already has an approved connection.

1. Sign up at <https://www.make.com> (free plan) → **Create a new scenario**.
2. **Module 1: Webhooks → Custom webhook.** Add → name `nukt-social-linkedin` → Save. Copy the URL (this is `MAKE_WEBHOOK_URL`). Click **Redetermine data structure**, then send a sample so Make learns the fields:

   ```powershell
   Invoke-RestMethod -Method Post -ContentType 'application/json' -Uri 'PASTE_WEBHOOK_URL' -Body '{"date":"2026-12-01","text":"Test text","imageUrl":"https://nukt.agency/og-image.jpg"}'
   ```

   Make should show "Successfully determined" with `date`, `text`, `imageUrl`.
3. **Module 2: HTTP → Get a file.** URL: map `imageUrl` from module 1.
4. **Module 3: LinkedIn → Create a Company Image Post** (in some Make versions it is "Create an Image Post" with the author set to your organization).
   - Connection: add your LinkedIn account. You must be an admin of the Nukt company page.
   - Organization: **Nukt**.
   - Content / Commentary: map `text` from module 1.
   - Image: **Map** the file from module 2 (file name and data).
   - Visibility: Public.
5. **Module 4: Webhooks → Webhook response.** Status `200`. Body:

   ```json
   {"ok": true, "id": "{{3.id}}"}
   ```

   (Pick module 3's post ID or URN from the mapping panel.) This module matters: the Worker only counts the LinkedIn post as successful when it gets `"ok": true` back. Without it Make just replies "Accepted" and the Worker reports a failure.
6. Optional: right-click module 3 → **Add error handler** → Webhook response with status `500` and body `{"ok": false, "error": "{{3.error.message}}"}` so the alert email carries LinkedIn's actual error.
7. Scenario settings (clock icon): **Immediately as data arrives**. Turn the scenario **ON**. Save.

Each post uses about 4 operations, around 120 a month.

The test above would create a real LinkedIn post if module 3 already existed, so only send it while the scenario has just the webhook module, or delete the test post afterwards.

---

## 5. Resend for alert emails

1. Sign up at <https://resend.com> with the address you want alerts sent to.
2. **API Keys → Create API key**, permission **Sending access**. Copy it (`RESEND_API_KEY`).
3. Without a verified domain, Resend only delivers from `onboarding@resend.dev` to your own signup address. So set `ALERT_EMAIL` to that address and leave `ALERT_FROM` as it is in `wrangler.toml`.
4. Optional: to send from `alerts@nukt.agency`, add the domain under **Domains** in Resend and create the DNS records it shows in Cloudflare DNS, then change `ALERT_FROM` in `wrangler.toml`.

---

## 6. Cloudflare Worker: secrets, deploy, switch on

All commands run in `G:\Khalil\portfolio-new\agents\social\worker`.

```powershell
cd G:\Khalil\portfolio-new\agents\social\worker
```

```powershell
npm install
```

```powershell
npx wrangler login
```

### 6.1 KV namespace

```powershell
npx wrangler kv namespace create SOCIAL_KV
```

Copy the `id` it prints into `wrangler.toml` (replace `REPLACE_WITH_KV_NAMESPACE_ID`).

### 6.2 Secrets

Run each line; wrangler asks you to paste the value (it is never written to disk or git):

```powershell
npx wrangler secret put GITHUB_TOKEN
```

```powershell
npx wrangler secret put FB_PAGE_ID
```

```powershell
npx wrangler secret put FB_PAGE_TOKEN
```

```powershell
npx wrangler secret put MAKE_WEBHOOK_URL
```

```powershell
npx wrangler secret put RESEND_API_KEY
```

```powershell
npx wrangler secret put ALERT_EMAIL
```

```powershell
npx wrangler secret put IMAGE_SIGNING_KEY
```

For `IMAGE_SIGNING_KEY` paste any long random string, for example the output of:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 6.3 Deploy

```powershell
npx wrangler deploy
```

The output shows your URL, like `https://nukt-social.<your-subdomain>.workers.dev`. Put it in `PUBLIC_URL` in `wrangler.toml` and deploy again. Check it:

```powershell
Invoke-RestMethod https://nukt-social.YOUR-SUBDOMAIN.workers.dev/health
```

Commit the `wrangler.toml` change (it only holds the KV id and URL, no secrets).

### 6.4 Switch it on

Nothing posts until the kill switch is set to `true`:

```powershell
npx wrangler kv key put enabled true --binding SOCIAL_KV --remote
```

From the first enabled run, the next 3 calendar days are dry runs (logged only, shown in the Monday digest and in `npx wrangler tail`), and day 4 posts for real. The cron runs at 14:00 UTC, which is 9:00 US Eastern in winter and 10:00 during daylight saving time (19:00 PKT).

Watch a run live:

```powershell
npx wrangler tail
```

---

## 7. Testing locally

**Offline test (no accounts needed):** runs the real Worker code against a sample queue with mocked GitHub, Facebook, Make and Resend. Nothing is posted.

```powershell
node G:\Khalil\portfolio-new\agents\social\worker\test\local-test.mjs
```

It checks the kill switch, the 3 dry-run days, going live on day 4 with the right UTM tags, never posting twice, a missing entry (nothing posted, alert sent), one platform failing, the Monday digest, and the signed image URL.

**With wrangler dev (real secrets, forced dry run):** create `agents/social/worker/.dev.vars` (git-ignored) with the same names as the secrets, then:

```powershell
npx wrangler kv key put enabled true --binding SOCIAL_KV --local
```

```powershell
npx wrangler kv key put force_dry_run true --binding SOCIAL_KV --local
```

```powershell
npx wrangler dev --test-scheduled
```

In another window trigger the cron:

```powershell
Invoke-RestMethod "http://localhost:8787/__scheduled?cron=0+14+*+*+*"
```

With `force_dry_run` set it reads the real queue from GitHub and logs the exact text it would post, without posting. It can still send real alert and digest emails.

---

## 8. How to pause, skip or fix things

| I want to… | Do this |
| --- | --- |
| Stop all posting now | `npx wrangler kv key put enabled false --binding SOCIAL_KV --remote` (or Cloudflare dashboard → Storage & Databases → KV → SOCIAL_KV → `enabled` → `false`) |
| Resume posting | same command with `true` |
| Keep it running but post nothing | `npx wrangler kv key put force_dry_run true --binding SOCIAL_KV --remote`; delete the key (`npx wrangler kv key delete force_dry_run --binding SOCIAL_KV --remote`) to go live again |
| Restart the 3-day dry run | `npx wrangler kv key delete first_run --binding SOCIAL_KV --remote` |
| Stop generating new content | Task Scheduler → right-click `nukt-social weekly` → **Disable** |
| Skip or change one day's post | Edit or delete `agents/social/queue/<date>.json`, commit and push before 14:00 UTC. A deleted day posts nothing and sends a "missing entry" alert. |
| Regenerate this week | Delete `agents/social/queue/week-<Monday>.json` (and the dated files you want replaced), push, then run the task. |
| Retry a failed platform | The Worker never retries on its own. Post that one manually, or wait for the next day. A platform that succeeded is never posted again for that date. |
| See what happened | Monday digest email, `npx wrangler tail`, or the KV keys `log:<date>` and `posted:<date>:<platform>` |

### Free-tier limits

| Service | Free tier | nukt-social use |
| --- | --- | --- |
| Cloudflare Workers | 100,000 requests/day | 1 cron run + a few image requests a day |
| Workers KV | 100,000 reads, 1,000 writes/day | under 20 writes a day |
| Make.com | 1,000 operations/month | about 120/month |
| Resend | 100 emails/day, 3,000/month | 1 digest a week, plus alerts |
| Meta Graph API | free | 1 post/day |
| Claude Code | your existing Claude plan | 1 run/week |
