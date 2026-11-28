<#
  Daily nukt-social content run (Claude Code headless), Monday-Friday.

  1. Skips (exit 0) when today's queue file is already committed.
  2. Runs `claude -p` with daily-prompt.md and a minimal, path-scoped tool list.
     Claude writes files only; it has no git access. It writes today's file
     (Friday: also Saturday and Sunday) and, on the first successful run of the
     ISO week, the weekly blog post.
  3. Guard: the script checks that only allowed content files changed and no
     commit was made. Otherwise it aborts (nothing pushed) and alerts.
  4. The script checks the blog post on its own, then schedules post times,
     validates, builds, commits and pushes.

  The blog never blocks the day's posts: if it is missing or fails its checks
  or the build, it is set aside (saved to the log folder), the posts still go
  out, an alert is sent, and the next weekday run that week tries again.

  If Claude fails or hits a usage limit, or a posts check fails, nothing is
  committed (so nothing is posted), the run's files are saved to the log
  folder and removed, and an alert is emailed through Resend when the user
  environment variables NUKT_RESEND_API_KEY and NUKT_ALERT_EMAIL are set.
  Logs: agents/social/logs/ (git-ignored)

  -Preview       print the dates, run context head and exact command; no git, no Claude.
  -WeekdaysOnly  exit quietly on Saturday and Sunday.
  -GuardOnly     run only the changed-files guard against the current working tree.
  -Today         pretend today is this date (yyyy-MM-dd), for -Preview testing.
#>
param([switch] $Preview, [switch] $WeekdaysOnly, [switch] $GuardOnly, [string] $Today)

$ErrorActionPreference = 'Continue'
$Now = if ($Today) { [datetime]::ParseExact($Today, 'yyyy-MM-dd', $null) } else { (Get-Date).Date }
if ($WeekdaysOnly -and $Now.DayOfWeek -in @('Saturday', 'Sunday')) { exit 0 }

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $Root

$OutputEncoding = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $OutputEncoding
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

$TodayText = $Now.ToString('yyyy-MM-dd')
$TodayFile = "agents/social/queue/$TodayText.json"
$Dates = @($TodayText)
if ($Now.DayOfWeek -eq 'Friday') { $Dates += $Now.AddDays(1).ToString('yyyy-MM-dd'), $Now.AddDays(2).ToString('yyyy-MM-dd') }
$DayFiles = @($Dates | ForEach-Object { "agents/social/queue/$_.json" })

# The only paths a run may change. Everything else aborts the push.
$ContentPaths = @('src/content/blog', 'agents/social/queue', 'agents/social/images')
$AllowedChange = '^(src/content/blog/[a-z0-9-]+\.md|agents/social/queue/\d{4}-\d{2}-\d{2}\.json|agents/social/images/\d{4}-\d{2}-\d{2}-[12]\.png)$'

$Stamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$LogDir = Join-Path $Root 'agents/social/logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Log = Join-Path $LogDir "daily-$Stamp.log"

function Write-Log([string] $Message) {
  $line = '[{0}] {1}' -f (Get-Date -Format 'HH:mm:ss'), $Message
  Add-Content -Path $Log -Value $line -Encoding UTF8
  Write-Output $line
}

function Send-Alert([string] $Subject, [string] $Message) {
  $apiKey = [Environment]::GetEnvironmentVariable('NUKT_RESEND_API_KEY', 'User')
  $to = [Environment]::GetEnvironmentVariable('NUKT_ALERT_EMAIL', 'User')
  if (-not $apiKey -or -not $to) {
    Write-Log 'Alert not sent: NUKT_RESEND_API_KEY / NUKT_ALERT_EMAIL are not set.'
    return
  }
  $body = @{
    from    = 'Nukt Social <onboarding@resend.dev>'
    to      = @($to)
    subject = "[nukt-social] $Subject"
    text    = "$Message`n`nLog: $Log"
  } | ConvertTo-Json
  try {
    Invoke-RestMethod -Method Post -Uri 'https://api.resend.com/emails' -ContentType 'application/json' `
      -Headers @{ Authorization = "Bearer $apiKey" } -Body ([Text.Encoding]::UTF8.GetBytes($body)) | Out-Null
    Write-Log "Alert sent to $to."
  } catch {
    Write-Log "Alert could not be sent: $($_.Exception.Message)"
  }
}

function Get-ChangedPaths {
  git -c core.quotepath=false status --porcelain=v1 --untracked-files=all | Where-Object { $_ } | ForEach-Object {
    $status = $_.Substring(0, 2)
    foreach ($path in ($_.Substring(3) -split ' -> ')) { [pscustomobject]@{ Status = $status; Path = $path.Trim('"') } }
  }
}

<# Problems with the working tree: paths outside $AllowedChange, deletions, or a new commit. #>
function Test-ChangeGuard([string] $HeadBefore) {
  $problems = @()
  foreach ($change in Get-ChangedPaths) {
    if ($change.Path -notmatch $AllowedChange) { $problems += "not allowed: $($change.Status) $($change.Path)" }
    elseif ($change.Status -match 'D') { $problems += "deletion not allowed: $($change.Path)" }
  }
  if ($HeadBefore -and (git rev-parse HEAD) -ne $HeadBefore) { $problems += 'a commit was made during the run' }
  return $problems
}

<# Saves this run's content files for review, then removes them so the next trigger can retry. #>
function Remove-RunOutput {
  $changes = @(Get-ChangedPaths | Where-Object { $_.Path -match $AllowedChange -and $_.Status -notmatch 'D' })
  if (-not $changes) { return }
  $keep = Join-Path $LogDir "failed-$Stamp"
  foreach ($change in $changes) {
    $target = Join-Path $keep $change.Path
    New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
    Copy-Item -LiteralPath $change.Path -Destination $target -Force
  }
  git checkout -- @ContentPaths 2>$null
  git clean -fdq -- @ContentPaths
  Write-Log "Run output saved to $keep and removed from the working tree."
}

function Exit-Run([int] $Code, [string] $Message, [switch] $KeepFiles) {
  Write-Log $Message
  if ($Code -ne 0) {
    # Guard failures keep everything in place for inspection; other failures clean up.
    if (-not $KeepFiles) { Remove-RunOutput }
    Send-Alert "Daily run failed ($TodayText): nothing will be posted" "$Message`n`nNothing was committed, so the poster has nothing new to publish for: $($Dates -join ', ')."
  }
  exit $Code
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
  if ($problems) { Exit-Run 1 ("Guard blocked the push:`n" + ($problems -join "`n")) -KeepFiles }
  Exit-Run 0 'Guard passed: only allowed content files changed.'
}

<#
  Minimal tools. No Glob/Grep, no git, no general shell; Read/Edit only inside
  these paths (Write is covered by Edit rules). Unlisted tools are refused
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
$ClaudeArgs = @('-p', '--permission-mode', 'default', '--allowedTools', $AllowedTools, '--max-turns', '100', '--output-format', 'json')

$Claude = Find-Claude
$CommandLine = "Get-Content prompt | & `"$(if ($Claude) { $Claude } else { 'claude' })`" " +
  (($ClaudeArgs | ForEach-Object { if ($_ -match '[\s,()*]') { "`"$_`"" } else { $_ } }) -join ' ')

function Test-Done { git cat-file -e "HEAD:$TodayFile" 2>$null; return $LASTEXITCODE -eq 0 }

# The blog is due on the first successful run of each ISO week (any weekday).
function Get-BlogStatus { (node agents/social/blog-week.mjs --today $TodayText) -join '' }
function Get-ContextArgs([bool] $BlogNeeded) {
  $contextArgs = @('agents/social/build-context.mjs', '--today', $TodayText, '--dates', ($Dates -join ','))
  if ($BlogNeeded) { $contextArgs += '--blog' }
  return $contextArgs
}

<# Moves blog files out of the commit (saved to the log folder). Posts are unaffected. #>
function Set-BlogAside([string[]] $Paths) {
  $keep = Join-Path $LogDir "blog-failed-$Stamp"
  foreach ($path in $Paths) {
    $target = Join-Path $keep $path
    New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
    Copy-Item -LiteralPath $path -Destination $target -Force
    git ls-files --error-unmatch -- $path *> $null
    if ($LASTEXITCODE -eq 0) { git checkout -- $path } else { Remove-Item -LiteralPath $path -Force }
  }
  Write-Log "Blog set aside to $keep; the day's posts continue without it."
}

if ($Preview) {
  $BlogStatus = Get-BlogStatus
  $ContextArgs = Get-ContextArgs ($BlogStatus -eq 'needed')
  Write-Output "Today: $TodayText ($($Now.DayOfWeek)); dates: $($Dates -join ', '); blog this week: $BlogStatus"
  Write-Output "Already completed: $(Test-Done)"
  (node @ContextArgs | Select-Object -First 16) -join "`n"
  Write-Output "Claude CLI: $(if ($Claude) { $Claude } else { 'NOT FOUND' })"
  Write-Output "Command: $CommandLine"
  exit 0
}

if (Test-Done) { Exit-Run 0 "Today's run ($TodayText) already completed. Skipping." }
if (-not $Claude) { Exit-Run 1 'Claude Code CLI not found. Install it and sign in (see agents/social/SETUP.md).' -KeepFiles }
if (git status --porcelain --untracked-files=all) { Exit-Run 1 'Working tree is not clean; the guard needs a clean start. Commit or stash first.' -KeepFiles }

Write-Log "Run $TodayText for $($Dates -join ', '): syncing with origin"
git pull --ff-only *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'git pull --ff-only failed (diverged branch). Fix the repo and re-run.' -KeepFiles }
if (Test-Done) { Exit-Run 0 "Today's run ($TodayText) was completed elsewhere. Skipping." }

$BlogStatus = Get-BlogStatus
$BlogNeeded = $BlogStatus -eq 'needed'
Write-Log "Weekly blog: $BlogStatus"
$ContextArgs = Get-ContextArgs $BlogNeeded
$Context = (node @ContextArgs) -join "`n"
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Could not build the run context.' -KeepFiles }
$Prompt = (Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot 'daily-prompt.md')) + "`n" + $Context

$HeadBefore = git rev-parse HEAD
Write-Log "Running: $CommandLine"
$Output = ($Prompt | & $Claude @ClaudeArgs 2>&1 | Out-String)
$ClaudeExit = $LASTEXITCODE
Add-Content -Path $Log -Value $Output -Encoding UTF8

# Guard first, before anything else touches git. A guard failure keeps the files for inspection.
$problems = Test-ChangeGuard $HeadBefore
if ($problems) { Exit-Run 1 ("Guard blocked the push. Nothing was committed or pushed:`n" + ($problems -join "`n")) -KeepFiles }

# Claude failures, including usage limits: post nothing.
$Result = $null
try { $Result = $Output.Substring($Output.IndexOf('{')) | ConvertFrom-Json } catch { }
$UsageLimit = $Output -match '(?i)usage limit|limit reached|hit your limit|rate_limit|429|overloaded'
if ($ClaudeExit -ne 0 -or -not $Result -or $Result.is_error -or $Result.subtype -ne 'success') {
  $reason = if ($UsageLimit) { 'Claude hit a usage or rate limit' } else { "Claude run failed (exit $ClaudeExit, $($Result.subtype))" }
  Exit-Run 1 "$reason. Nothing will be posted for $($Dates -join ', ')."
}

$Missing = $DayFiles | Where-Object { -not (Test-Path $_) }
if ($Missing) { Exit-Run 1 "Claude did not write: $($Missing -join ', '). Its summary: $($Result.result)" }

# Blog first, on its own: a problem here sets the blog aside but never stops the posts.
$BlogProblem = $null
$BlogChanges = @(Get-ChangedPaths | Where-Object { $_.Path -like 'src/content/blog/*' })
$EditedOld = @($BlogChanges | Where-Object { $_.Status -ne '??' } | ForEach-Object { $_.Path })
$NewBlogs = @($BlogChanges | Where-Object { $_.Status -eq '??' } | ForEach-Object { $_.Path })
if ($EditedOld) { Set-BlogAside $EditedOld; $BlogProblem = "Existing blog posts were edited (changes reverted): $($EditedOld -join ', ')." }
if (-not $BlogNeeded -and $NewBlogs) {
  Set-BlogAside $NewBlogs; $NewBlogs = @()
  $BlogProblem = 'A blog post was written although this week already has one; it was not published.'
} elseif ($BlogNeeded -and $NewBlogs.Count -eq 0) {
  $BlogProblem = 'Claude did not write the weekly blog post.'
} elseif ($BlogNeeded -and $NewBlogs.Count -gt 1) {
  Set-BlogAside $NewBlogs; $NewBlogs = @()
  $BlogProblem = 'Claude wrote more than one blog post; none were published.'
} elseif ($BlogNeeded) {
  $Slug = [IO.Path]::GetFileNameWithoutExtension($NewBlogs[0])
  node agents/social/validate-queue.mjs --blog $Slug --blog-date $TodayText *>> $Log
  if ($LASTEXITCODE -ne 0) { Set-BlogAside $NewBlogs; $NewBlogs = @(); $BlogProblem = "Blog post '$Slug' failed validation (see log); it was not published." }
}

node agents/social/schedule.mjs @DayFiles *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Scheduling failed (see log); nothing was committed.' }

# Posts are validated after the blog decision, so a teaser can never point at a blog that was set aside.
node agents/social/validate-queue.mjs --dates ($Dates -join ',') *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Validator failed for the posts (see log); nothing was committed.' }

npm run build *>> $Log
if ($LASTEXITCODE -ne 0 -and $NewBlogs) {
  Set-BlogAside $NewBlogs; $NewBlogs = @()
  $BlogProblem = 'The site build failed with the new blog post; it was not published.'
  node agents/social/validate-queue.mjs --dates ($Dates -join ',') *>> $Log
  if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Validator failed for the posts after removing the blog (see log); nothing was committed.' }
  npm run build *>> $Log
}
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Site build failed; nothing was committed.' }

$Message = "Social content for $($Dates -join ', ')"
if ($NewBlogs) { $Message += " + blog $([IO.Path]::GetFileNameWithoutExtension($NewBlogs[0]))" }
git add -- @ContentPaths *>> $Log
git commit -m $Message *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'git commit failed.' }

# Re-check the commit itself before it leaves the machine.
$Outside = git -c core.quotepath=false diff --name-only "$HeadBefore..HEAD" | Where-Object { $_ -notmatch $AllowedChange }
if ($Outside) {
  git reset --soft $HeadBefore *>> $Log
  Exit-Run 1 ("Commit contained files outside the allowed paths; not pushed:`n" + ($Outside -join "`n")) -KeepFiles
}

git push *>> $Log
if ($LASTEXITCODE -ne 0) {
  git pull --rebase *>> $Log
  git push *>> $Log
  if ($LASTEXITCODE -ne 0) { Exit-Run 1 'git push failed after one rebase retry. The commit is local only, so nothing will be posted until it is pushed.' -KeepFiles }
}

$Count = ($DayFiles | ForEach-Object { (Get-Content -Raw $_ | ConvertFrom-Json).posts.Count } | Measure-Object -Sum).Sum
if ($BlogProblem) {
  $retry = if ($Now.DayOfWeek -eq 'Friday') { 'This was the last weekday run of the week, so there is no blog post this week.' } else { 'The next weekday run this week will try again.' }
  Write-Log "Blog problem: $BlogProblem"
  Send-Alert "Weekly blog post not published ($TodayText)" "$BlogProblem`n`nThe day's social posts were still committed and scheduled ($Count post(s) for $($Dates -join ', ')).`n$retry"
}
Exit-Run 0 "Run $TodayText done: $Count post(s) for $($Dates -join ', ') queued and pushed$(if ($NewBlogs) { ', plus the weekly blog post' })."
