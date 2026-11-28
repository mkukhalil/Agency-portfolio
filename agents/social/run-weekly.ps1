<#
  Weekly nukt-social content run (Claude Code headless).

  1. Skips (exit 0) when this week's marker already exists.
  2. Runs `claude -p` with weekly-prompt.md and a minimal, path-scoped tool list.
     Claude writes files only; it has no git access.
  3. Guard: the script checks that only allowed content files changed and that
     no commit was made. Anything else aborts the run (nothing is pushed) and
     sends the failure alert.
  4. The script validates, commits and pushes.

  Any failure exits 1 and emails an alert through Resend when the user
  environment variables NUKT_RESEND_API_KEY and NUKT_ALERT_EMAIL are set.
  Logs: agents/social/logs/weekly-<timestamp>.log (git-ignored)

  -Preview       print the dates, run context and exact command; no git, no Claude.
  -WeekdaysOnly  exit quietly on Saturday and Sunday (for the logon trigger).
  -GuardOnly     run only the changed-files guard against the current working tree
                 (to test it); never commits or pushes.
#>
param([switch] $Preview, [switch] $WeekdaysOnly, [switch] $GuardOnly)

$ErrorActionPreference = 'Continue'
if ($WeekdaysOnly -and (Get-Date).DayOfWeek -in @('Saturday', 'Sunday')) { exit 0 }

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $Root

# UTF-8 for the prompt we pipe in and everything we log (PowerShell 5.1 defaults differ).
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $OutputEncoding
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

$Today = (Get-Date).Date
$Monday = $Today.AddDays( - (([int]$Today.DayOfWeek + 6) % 7))
$NextMonday = $Monday.AddDays(7)
$Week = $Monday.ToString('yyyy-MM-dd')
$Marker = "agents/social/queue/week-$Week.json"

# The only paths a run may change. Everything else aborts the push.
$AllowedChange = '^(src/content/blog/[a-z0-9-]+\.md|agents/social/queue/[A-Za-z0-9-]+\.json|agents/social/images/\d{4}-\d{2}-\d{2}\.png)$'

$LogDir = Join-Path $Root 'agents/social/logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Log = Join-Path $LogDir ("weekly-{0}.log" -f (Get-Date -Format 'yyyy-MM-dd_HHmmss'))

function Write-Log([string] $Message) {
  $line = '[{0}] {1}' -f (Get-Date -Format 'HH:mm:ss'), $Message
  Add-Content -Path $Log -Value $line -Encoding UTF8
  Write-Output $line
}

function Send-FailureAlert([string] $Message) {
  $apiKey = [Environment]::GetEnvironmentVariable('NUKT_RESEND_API_KEY', 'User')
  $to = [Environment]::GetEnvironmentVariable('NUKT_ALERT_EMAIL', 'User')
  if (-not $apiKey -or -not $to) {
    Write-Log 'Alert not sent: NUKT_RESEND_API_KEY / NUKT_ALERT_EMAIL are not set.'
    return
  }
  $body = @{
    from    = 'Nukt Social <onboarding@resend.dev>'
    to      = @($to)
    subject = "[nukt-social] Weekly run failed ($Week)"
    text    = "$Message`n`nLog: $Log"
  } | ConvertTo-Json
  try {
    Invoke-RestMethod -Method Post -Uri 'https://api.resend.com/emails' -ContentType 'application/json' `
      -Headers @{ Authorization = "Bearer $apiKey" } -Body ([Text.Encoding]::UTF8.GetBytes($body)) | Out-Null
    Write-Log "Failure alert sent to $to."
  } catch {
    Write-Log "Failure alert could not be sent: $($_.Exception.Message)"
  }
}

function Exit-Run([int] $Code, [string] $Message) {
  Write-Log $Message
  if ($Code -ne 0) { Send-FailureAlert $Message }
  exit $Code
}

<#
  Returns the problems with the working tree: any changed, added, deleted or
  untracked path outside $AllowedChange, any deletion, and any new commit.
#>
function Test-ChangeGuard([string] $HeadBefore) {
  $problems = @()
  $lines = git -c core.quotepath=false status --porcelain=v1 --untracked-files=all
  foreach ($line in $lines) {
    if (-not $line) { continue }
    $status = $line.Substring(0, 2)
    foreach ($path in ($line.Substring(3) -split ' -> ')) {
      $path = $path.Trim('"')
      if ($path -notmatch $AllowedChange) { $problems += "not allowed: $status $path" }
      elseif ($status -match 'D') { $problems += "deletion not allowed: $path" }
    }
  }
  if ($HeadBefore -and (git rev-parse HEAD) -ne $HeadBefore) { $problems += 'a commit was made during the run' }
  return $problems
}

function Find-Claude {
  $command = Get-Command claude -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  foreach ($candidate in @("$env:USERPROFILE\.local\bin\claude.exe", "$env:APPDATA\npm\claude.cmd")) {
    if (Test-Path $candidate) { return $candidate }
  }
  return $null
}

if ($GuardOnly) {
  $problems = Test-ChangeGuard $null
  if ($problems) { Exit-Run 1 ("Guard blocked the push:`n" + ($problems -join "`n")) }
  Exit-Run 0 'Guard passed: only allowed content files changed.'
}

if (Test-Path $Marker) { Exit-Run 0 "Week $Week already generated ($Marker). Skipping." }

# Dates to write: today through next Monday, keeping today's file if last week's buffer made one.
$Dates = @()
for ($day = $Today; $day -le $NextMonday; $day = $day.AddDays(1)) {
  $date = $day.ToString('yyyy-MM-dd')
  if ($day -eq $Today -and (Test-Path "agents/social/queue/$date.json")) { continue }
  $Dates += $date
}

<#
  Minimal tools. Claude has no Glob/Grep, no git, no general shell, and cannot
  read or edit files outside these paths; the repo facts it needs are inlined
  below. Write is covered by the Edit(...) rules. Unlisted tools are refused
  because headless mode cannot ask for permission.
#>
$AllowedTools = @(
  'WebSearch',
  'WebFetch',
  'Read(src/content/blog/**)',
  'Read(agents/social/**)',
  'Edit(src/content/blog/**)',
  'Edit(agents/social/queue/**)',
  'Bash(node agents/social/render-card.mjs:*)',
  'Bash(node agents/social/validate-queue.mjs:*)',
  'Bash(npm run build)'
) -join ','
$ClaudeArgs = @('-p', '--permission-mode', 'default', '--allowedTools', $AllowedTools, '--max-turns', '150', '--output-format', 'text')

# Repo facts Claude may use, inlined because it cannot read src/data or public/.
function Get-FileBlock([string] $Path) {
  "### $Path`n``````n$((Get-Content -Raw -Encoding UTF8 $Path).Trim())`n``````"
}
$Since = $Today.AddDays(-30).ToString('yyyy-MM-dd')
$RecentPosts = Get-ChildItem agents/social/queue -Filter '????-??-??.json' |
  Where-Object { $_.BaseName -ge $Since } | Sort-Object Name | ForEach-Object {
    $entry = Get-Content -Raw -Encoding UTF8 $_.FullName | ConvertFrom-Json
    "- $($entry.date) [$($entry.type)] $($entry.card.headline) | $(($entry.linkedin -split "`n")[0])"
  }
$BlogPosts = Get-ChildItem src/content/blog -Filter '*.md' | ForEach-Object {
  $title = (Select-String -Path $_.FullName -Pattern '^title:\s*(.+)$' | Select-Object -First 1).Matches.Groups[1].Value
  "- $($_.BaseName): $title"
}

$RunContext = @"

## Run context

- Today: $($Today.ToString('yyyy-MM-dd')) ($($Today.DayOfWeek))
- This week's Monday: $Week
- Write queue entries for exactly these dates: $($Dates -join ', ')
- Week marker to write last: $Marker

### Posts from the last 30 days
$(if ($RecentPosts) { $RecentPosts -join "`n" } else { '(none)' })

### Existing blog posts (slug: title)
$(if ($BlogPosts) { $BlogPosts -join "`n" } else { '(none)' })

## Repo facts (the only source for claims about Nukt and its clients)

$(Get-FileBlock 'src/data/services.js')

$(Get-FileBlock 'src/data/pricing.js')

$(Get-FileBlock 'src/data/projects.js')

$(Get-FileBlock 'src/data/testimonials.js')

$(Get-FileBlock 'public/llms.txt')
"@
$Prompt = (Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot 'weekly-prompt.md')) + $RunContext

$Claude = Find-Claude
$CommandLine = "Get-Content prompt | & `"$(if ($Claude) { $Claude } else { 'claude' })`" " +
  (($ClaudeArgs | ForEach-Object { if ($_ -match '[\s,()*]') { "`"$_`"" } else { $_ } }) -join ' ')

if ($Preview) {
  Write-Output $RunContext.Substring(0, [Math]::Min(1200, $RunContext.Length))
  Write-Output "`nClaude CLI: $(if ($Claude) { $Claude } else { 'NOT FOUND' })"
  Write-Output "Command: $CommandLine"
  exit 0
}

if ($Dates.Count -eq 0) { Exit-Run 1 'No dates to write.' }
if (-not $Claude) { Exit-Run 1 'Claude Code CLI not found. Install it and sign in (see agents/social/SETUP.md).' }
if (git status --porcelain --untracked-files=all) { Exit-Run 1 'Working tree is not clean; the guard needs a clean start. Commit or stash first.' }

Write-Log "Week ${Week}: syncing with origin"
git pull --ff-only *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'git pull --ff-only failed (diverged branch). Fix the repo and re-run.' }
if (Test-Path $Marker) { Exit-Run 0 "Week $Week was generated elsewhere. Skipping." }

$HeadBefore = git rev-parse HEAD
Write-Log "Running: $CommandLine"
$Prompt | & $Claude @ClaudeArgs *>> $Log
$ClaudeExit = $LASTEXITCODE

# Guard first, before anything else touches git.
$problems = Test-ChangeGuard $HeadBefore
if ($problems) { Exit-Run 1 ("Guard blocked the push. Nothing was committed or pushed:`n" + ($problems -join "`n")) }
if ($ClaudeExit -ne 0) { Exit-Run 1 "claude exited with code $ClaudeExit; nothing was committed." }
if (-not (Test-Path $Marker)) { Exit-Run 1 "Run finished but $Marker was not written; nothing was committed." }

node agents/social/validate-queue.mjs --week $Week *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Validator failed; nothing was committed.' }

npm run build *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Site build failed; nothing was committed.' }

git add -- src/content/blog agents/social/queue agents/social/images *>> $Log
git commit -m "Social content for week of $Week" *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'git commit failed.' }

# Re-check the commit itself before it leaves the machine.
$Committed = git -c core.quotepath=false diff --name-only "$HeadBefore..HEAD"
$Outside = $Committed | Where-Object { $_ -notmatch $AllowedChange }
if ($Outside) { Exit-Run 1 ("Commit contains files outside the allowed paths; not pushed:`n" + ($Outside -join "`n")) }

git push *>> $Log
if ($LASTEXITCODE -ne 0) {
  git pull --rebase *>> $Log
  git push *>> $Log
  if ($LASTEXITCODE -ne 0) { Exit-Run 1 'git push failed after one rebase retry.' }
}

Exit-Run 0 "Week $Week done: $($Dates.Count) post(s) queued and pushed."
