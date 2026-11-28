<#
  End-to-end test of run-daily.ps1 with a fake Claude. Tests the committed code (HEAD).

  Creates a throwaway git worktree whose branch pushes to a local bare test
  remote (never GitHub), puts test/fake-claude.mjs on the PATH as `claude`,
  and runs the real run-daily.ps1 for:

    1. Tuesday, Monday missed: blog requested, published with the day's posts.
    2. Wednesday: blog already done this week, not requested.
    3. Next Monday, blog fails validation: posts still committed and pushed,
       blog set aside, blog alert logged.
    4. Next Tuesday: blog retried and published.
    5. Next Wednesday, usage limit: nothing committed, exit 1.
    6. Second trigger on Tuesday: skipped.

  Usage: powershell -ExecutionPolicy Bypass -File agents\social\test\run-daily-e2e.ps1
#>
$ErrorActionPreference = 'Stop'
$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$Work = Join-Path ([IO.Path]::GetTempPath()) ("nukt-e2e-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
$Tree = Join-Path $Work 'repo'
$Remote = Join-Path $Work 'remote.git'
$Fake = Join-Path $Work 'bin'
$script:Failed = 0
$RemoteName = "e2e-" + [guid]::NewGuid().ToString("N").Substring(0, 6)  # worktrees share the repo config, so keep it unique and remove it after

function Assert-True([bool] $Condition, [string] $Name) {
  if ($Condition) { Write-Output "  PASS  $Name" } else { Write-Output "  FAIL  $Name"; $script:Failed++ }
}

function Invoke-Run([string] $Date, [string] $Mode) {
  $env:FAKE_MODE = $Mode
  $out = powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Tree 'agents\social\run-daily.ps1') -Today $Date 2>&1 | Out-String
  return [pscustomobject]@{ Exit = $LASTEXITCODE; Output = $out }
}

function Get-RemoteFiles { git -C $Tree ls-tree -r --name-only $RemoteName/e2e | Out-String }

try {
  New-Item -ItemType Directory -Force $Work, $Fake | Out-Null
  git -C $Repo worktree add -q --detach $Tree HEAD
  git init -q --bare $Remote
  Push-Location $Tree
  $ErrorActionPreference = 'Continue'
  git checkout -q -b e2e
  git remote add $RemoteName $Remote
  git push -q -u $RemoteName e2e 2>$null
  cmd /c mklink /J (Join-Path $Tree 'node_modules') (Join-Path $Repo 'node_modules') | Out-Null
  Set-Content -Path (Join-Path $Fake 'claude.cmd') -Value "@node `"$Tree\agents\social\test\fake-claude.mjs`" %*" -Encoding ASCII
  $env:PATH = "$Fake;$env:PATH"

  Write-Output '1. Tuesday 2026-12-08, Monday missed'
  $r = Invoke-Run '2026-12-08' 'ok'
  $files = Get-RemoteFiles
  Assert-True ($r.Exit -eq 0) 'run succeeds'
  Assert-True ($r.Output -match 'plus the weekly blog post') 'blog requested and published'
  Assert-True ($files -match 'src/content/blog/e2e-blog-2026-12-08.md') 'blog pushed'
  Assert-True ($files -match 'agents/social/queue/2026-12-08.json') 'posts pushed'

  Write-Output '2. Wednesday 2026-12-09'
  $r = Invoke-Run '2026-12-09' 'ok'
  $files = Get-RemoteFiles
  Assert-True ($r.Exit -eq 0) 'run succeeds'
  Assert-True ($r.Output -notmatch 'weekly blog post') 'blog not requested again this week'
  Assert-True ($files -notmatch 'e2e-blog-2026-12-09') 'no second blog'
  Assert-True ($files -match 'agents/social/queue/2026-12-09.json') 'posts pushed'

  Write-Output '3. Next Monday 2026-12-14, blog fails validation'
  $r = Invoke-Run '2026-12-14' 'badblog'
  $files = Get-RemoteFiles
  Assert-True ($r.Exit -eq 0) 'run still succeeds'
  Assert-True ($files -match 'agents/social/queue/2026-12-14.json') 'posts still committed and pushed'
  Assert-True ($files -notmatch 'e2e-blog-2026-12-14') 'failed blog not published'
  $day = Get-Content -Raw (Join-Path $Tree 'agents/social/queue/2026-12-14.json') | ConvertFrom-Json
  Assert-True (-not [string]::IsNullOrEmpty($day.posts[0].schedule.facebook)) 'posts scheduled'
  $log = Get-ChildItem (Join-Path $Tree 'agents/social/logs') -Filter 'daily-*.log' | Sort-Object LastWriteTime | Select-Object -Last 1 | Get-Content -Raw
  Assert-True ($log -match "Blog problem: Blog post 'e2e-blog-2026-12-14' failed validation") 'blog alert raised'
  Assert-True ($log -match 'The next weekday run this week will try again|Alert not sent') 'alert path taken'
  Assert-True ((Get-ChildItem (Join-Path $Tree 'agents/social/logs') -Directory -Filter 'blog-failed-*').Count -ge 1) 'failed blog saved for review'
  Assert-True (-not (git status --porcelain)) 'working tree clean afterwards'

  Write-Output '4. Next Tuesday 2026-12-15, blog retried'
  $r = Invoke-Run '2026-12-15' 'ok'
  $files = Get-RemoteFiles
  Assert-True ($r.Exit -eq 0) 'run succeeds'
  Assert-True ($files -match 'src/content/blog/e2e-blog-2026-12-15.md') 'blog published on retry'

  Write-Output '5. Next Wednesday 2026-12-16, usage limit'
  $before = git rev-parse HEAD
  $r = Invoke-Run '2026-12-16' 'limit'
  Assert-True ($r.Exit -eq 1) 'run fails'
  Assert-True ($r.Output -match 'usage or rate limit') 'usage limit detected'
  Assert-True ((git rev-parse HEAD) -eq $before) 'nothing committed'
  Assert-True ((Get-RemoteFiles) -notmatch '2026-12-16') 'nothing pushed'
  Assert-True (-not (git status --porcelain)) 'partial output removed'

  Write-Output '6. Second trigger on 2026-12-15'
  $r = Invoke-Run '2026-12-15' 'ok'
  Assert-True ($r.Exit -eq 0 -and $r.Output -match 'already completed') 'skipped'
}
catch {
  Write-Output "  FAIL  test aborted: $_"
  $script:Failed++
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
  if (Test-Path (Join-Path $Tree 'node_modules')) { cmd /c rmdir (Join-Path $Tree 'node_modules') | Out-Null }
  git -C $Repo worktree remove --force $Tree 2>$null
  git -C $Repo branch -D e2e -q 2>$null
  git -C $Repo remote remove $RemoteName 2>$null
  Remove-Item -Recurse -Force $Work -ErrorAction SilentlyContinue
}

if ($script:Failed) { Write-Output "`n$($script:Failed) check(s) failed"; exit 1 }
Write-Output "`nAll end-to-end checks passed"
