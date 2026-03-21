param(
  [switch]$ChecksOnly,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Set-Location 'D:\project\oop-draw'

$results = [System.Collections.Generic.List[object]]::new()

function Add-Result {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Details
  )

  $results.Add([pscustomobject]@{
      Name = $Name
      Status = $Status
      Details = $Details
    })
}

function Invoke-RepoCommand {
  param(
    [string]$Name,
    [string]$Command
  )

  try {
    $output = & pwsh -NoProfile -Command $Command 2>&1 | Out-String
    Add-Result -Name $Name -Status 'PASS' -Details ($output.Trim())
    return $true
  }
  catch {
    Add-Result -Name $Name -Status 'FAIL' -Details ($_ | Out-String)
    return $false
  }
}

function Stop-OopDrawProcesses {
  param(
    [string[]]$Patterns
  )

  $processes = Get-CimInstance Win32_Process | Where-Object {
    $commandLine = $_.CommandLine
    if (-not $commandLine) {
      return $false
    }

    if ($commandLine -notlike '*oop-draw*') {
      return $false
    }

    foreach ($pattern in $Patterns) {
      if ($commandLine -like ('*' + $pattern + '*')) {
        return $true
      }
    }

    return $false
  }

  foreach ($process in $processes) {
    taskkill /PID $process.ProcessId /T /F 2>$null | Out-Null
  }
}

function Invoke-WebDevSmoke {
  $logPath = 'D:\project\oop-draw\.tmp-dev-web.log'
  Remove-Item $logPath -ErrorAction SilentlyContinue

  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'pnpm dev:web > .tmp-dev-web.log 2>&1' -WorkingDirectory 'D:\project\oop-draw' -PassThru
  Start-Sleep -Seconds 8
  $output = if (Test-Path $logPath) { Get-Content $logPath -Raw } else { '' }

  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
  Stop-OopDrawProcesses -Patterns @('editor-web', 'vite.js')

  if ($output -match 'VITE' -and $output -match 'Local') {
    Add-Result -Name 'dev:web' -Status 'PASS' -Details ($output.Trim())
    return $true
  }

  Add-Result -Name 'dev:web' -Status 'FAIL' -Details $output.Trim()
  return $false
}

function Invoke-DesktopDevSmoke {
  $logPath = 'D:\project\oop-draw\.tmp-dev-desktop.log'
  Remove-Item $logPath -ErrorAction SilentlyContinue

  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'pnpm dev:desktop > .tmp-dev-desktop.log 2>&1' -WorkingDirectory 'D:\project\oop-draw' -PassThru
  Start-Sleep -Seconds 10

  $output = if (Test-Path $logPath) { Get-Content $logPath -Raw } else { '' }
  $electronProcesses = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'electron.exe' -and $_.CommandLine -like '*D:\project\oop-draw\apps\editor-desktop*'
  }

  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
  Stop-OopDrawProcesses -Patterns @('editor-desktop', 'electron-vite.js', 'electron.exe')

  if ($electronProcesses.Count -gt 0) {
    Add-Result -Name 'dev:desktop' -Status 'PASS' -Details ($output.Trim())
    return $true
  }

  Add-Result -Name 'dev:desktop' -Status 'FAIL' -Details $output.Trim()
  return $false
}

$allPassed = $true
$allPassed = (Invoke-RepoCommand -Name 'typecheck' -Command 'pnpm typecheck') -and $allPassed
$allPassed = (Invoke-RepoCommand -Name 'lint' -Command 'pnpm lint') -and $allPassed
$allPassed = (Invoke-RepoCommand -Name 'test' -Command 'pnpm test') -and $allPassed

if (-not $SkipBuild) {
  $allPassed = (Invoke-RepoCommand -Name 'build:web' -Command 'pnpm build:web') -and $allPassed
  $allPassed = (Invoke-RepoCommand -Name 'build:desktop' -Command 'pnpm build:desktop') -and $allPassed
}

if (-not $ChecksOnly) {
  $allPassed = (Invoke-WebDevSmoke) -and $allPassed
  $allPassed = (Invoke-DesktopDevSmoke) -and $allPassed
}

$results | Format-Table -AutoSize | Out-String | Write-Host

if (-not $allPassed) {
  exit 1
}

