<#
  Registers the "nukt-social daily" Windows scheduled task for the current user:
  - Monday-Friday at 12:30 (local time = PKT on this laptop), run as soon as
    possible after a missed start.
  - At logon (5-minute delay); the script skips Saturday/Sunday and any day
    whose run already completed.
  Removes the old "nukt-social weekly" task if it exists.

  Run once:  powershell -ExecutionPolicy Bypass -File agents\social\register-task.ps1
#>
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Script = Join-Path $Root 'agents\social\run-daily.ps1'
$User = "$env:USERDOMAIN\$env:USERNAME"

if (Get-ScheduledTask -TaskName 'nukt-social weekly' -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName 'nukt-social weekly' -Confirm:$false
  Write-Output 'Removed the old "nukt-social weekly" task.'
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Script`" -WeekdaysOnly" `
  -WorkingDirectory $Root

$weekdays = New-ScheduledTaskTrigger -Weekly -WeeksInterval 1 -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At '12:30'
$logon = New-ScheduledTaskTrigger -AtLogOn -User $User
$logon.Delay = 'PT5M'

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -RunOnlyIfNetworkAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Register-ScheduledTask -TaskName 'nukt-social daily' `
  -Description 'Writes the day''s Nukt social posts with Claude Code and pushes them.' `
  -Action $action -Trigger @($weekdays, $logon) -Settings $settings `
  -User $User -RunLevel Limited -Force | Out-Null

Write-Output 'Registered "nukt-social daily". Open Task Scheduler to review it.'
