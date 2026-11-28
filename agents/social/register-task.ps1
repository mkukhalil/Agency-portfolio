<#
  Registers the "nukt-social weekly" Windows scheduled task for the current user:
  - Weekly, Monday 12:30 (local time = PKT on this laptop), run as soon as
    possible after a missed start.
  - At logon (5-minute delay); the script itself skips Saturday/Sunday and
    any week that is already generated.

  Run once from PowerShell:  powershell -ExecutionPolicy Bypass -File agents\social\register-task.ps1
#>
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Script = Join-Path $Root 'agents\social\run-weekly.ps1'

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Script`" -WeekdaysOnly" `
  -WorkingDirectory $Root

$weekly = New-ScheduledTaskTrigger -Weekly -WeeksInterval 1 -DaysOfWeek Monday -At '12:30'
$logon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$logon.Delay = 'PT5M'

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -RunOnlyIfNetworkAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask -TaskName 'nukt-social weekly' `
  -Description 'Generates the week of Nukt social posts with Claude Code and pushes them.' `
  -Action $action -Trigger @($weekly, $logon) -Settings $settings `
  -User "$env:USERDOMAIN\$env:USERNAME" -RunLevel Limited -Force

Write-Output 'Registered "nukt-social weekly". Open Task Scheduler to review it.'
