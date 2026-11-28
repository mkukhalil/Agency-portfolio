<#
  Weekly nukt-social content run (Claude Code headless).

  Runs `claude -p` with weekly-prompt.md, then verifies the result:
  week marker written, validator passing, everything committed and pushed.
  Skips (exit 0) when this week's marker already exists, so Task Scheduler
  can trigger it often without duplicates. Exits 1 on any failure.

  Logs: agents/social/logs/weekly-<timestamp>.log

  -Preview       prints the dates and run context without pulling or calling Claude.
  -WeekdaysOnly  exits quietly on Saturday and Sunday (Task Scheduler's logon
                 trigger cannot be limited to weekdays itself).
#>
param([switch] $Preview, [switch] $WeekdaysOnly)

$ErrorActionPreference = 'Continue'
if ($WeekdaysOnly -and (Get-Date).DayOfWeek -in @('Saturday', 'Sunday')) { exit 0 }
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $Root

# UTF-8 for the prompt we pipe in and the output we log (PowerShell 5.1 defaults to ASCII).
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $OutputEncoding
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'  # also applies to >> redirection

$Today = (Get-Date).Date
$Monday = $Today.AddDays( - (([int]$Today.DayOfWeek + 6) % 7))
$NextMonday = $Monday.AddDays(7)
$Week = $Monday.ToString('yyyy-MM-dd')
$Marker = "agents/social/queue/week-$Week.json"

$LogDir = Join-Path $Root 'agents/social/logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Log = Join-Path $LogDir ("weekly-{0}.log" -f (Get-Date -Format 'yyyy-MM-dd_HHmmss'))

function Write-Log([string] $Message) {
  $line = '[{0}] {1}' -f (Get-Date -Format 'HH:mm:ss'), $Message
  Add-Content -Path $Log -Value $line -Encoding UTF8
  Write-Output $line
}

function Exit-Run([int] $Code, [string] $Message) {
  Write-Log $Message
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

if (Test-Path $Marker) { Exit-Run 0 "Week $Week already generated ($Marker). Skipping." }

if (-not $Preview) {
  Write-Log "Week ${Week}: syncing with origin"
  git pull --ff-only *>> $Log
  if ($LASTEXITCODE -ne 0) { Exit-Run 1 'git pull --ff-only failed (local changes or diverged branch). Fix the repo and re-run.' }
  if (Test-Path $Marker) { Exit-Run 0 "Week $Week was generated elsewhere. Skipping." }
}

$Claude = Find-Claude
if (-not $Claude -and -not $Preview) { Exit-Run 1 'Claude Code CLI not found. Install it and sign in (see agents/social/SETUP.md).' }

# Dates to write: today through next Monday, keeping files for today that already exist
# (last week's buffer day may already be live).
$Dates = @()
for ($day = $Today; $day -le $NextMonday; $day = $day.AddDays(1)) {
  $date = $day.ToString('yyyy-MM-dd')
  if ($day -eq $Today -and (Test-Path "agents/social/queue/$date.json")) { continue }
  $Dates += $date
}
if ($Dates.Count -eq 0) { Exit-Run 1 'No dates to write.' }

$RunContext = @"

## Run context

- Today: $($Today.ToString('yyyy-MM-dd')) ($($Today.DayOfWeek))
- This week's Monday: $Week
- Write queue entries for exactly these dates: $($Dates -join ', ')
- Week marker to write last: $Marker
"@
$Prompt = (Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot 'weekly-prompt.md')) + $RunContext

# Only the tools the run needs. Anything else is refused in headless mode.
$AllowedTools = @(
  'Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch', 'WebFetch',
  'Bash(node agents/social/render-card.mjs:*)',
  'Bash(node agents/social/validate-queue.mjs:*)',
  'Bash(npm run lint)', 'Bash(npm run build)',
  'Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git log:*)',
  'Bash(git add agents/social/queue agents/social/images src/content/blog)',
  'Bash(git commit:*)', 'Bash(git push)', 'Bash(git pull --rebase)'
) -join ','

if ($Preview) {
  Write-Output $RunContext
  Write-Output "Claude CLI: $(if ($Claude) { $Claude } else { 'NOT FOUND' })"
  Write-Output "Allowed tools: $AllowedTools"
  exit 0
}

Write-Log "Running Claude Code for $($Dates.Count) date(s): $($Dates -join ', ')"
$Prompt | & $Claude -p --allowedTools $AllowedTools --max-turns 150 --output-format text *>> $Log
$ClaudeExit = $LASTEXITCODE
if ($ClaudeExit -ne 0) { Exit-Run 1 "claude exited with code $ClaudeExit" }

# Verify instead of trusting the summary.
if (-not (Test-Path $Marker)) { Exit-Run 1 "Run finished but $Marker was not written." }

node agents/social/validate-queue.mjs --week $Week *>> $Log
if ($LASTEXITCODE -ne 0) { Exit-Run 1 'Validator failed after the run. See the log above.' }

$Dirty = git status --porcelain -- agents/social/queue agents/social/images src/content/blog
if ($Dirty) { Exit-Run 1 "Uncommitted content left behind:`n$Dirty" }

git fetch --quiet origin *>> $Log
$Unpushed = git rev-list '@{u}..HEAD' 2>$null
if ($LASTEXITCODE -ne 0 -or $Unpushed) { Exit-Run 1 'Commits were not pushed to origin.' }

Exit-Run 0 "Week $Week done: $($Dates.Count) post(s) queued and pushed."
