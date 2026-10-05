# Affiche les derniers codes de connexion SMS écrits dans les logs Cloud Run
# (tant qu'aucune passerelle SMS n'est configurée sur e-hetsena-api).
#
#   powershell -ExecutionPolicy Bypass -File deploy\otp-logs.ps1            # 30 dernières minutes
#   powershell -ExecutionPolicy Bypass -File deploy\otp-logs.ps1 -Minutes 120
#   powershell -ExecutionPolicy Bypass -File deploy\otp-logs.ps1 -Watch     # actualise toutes les 5 s

param(
  [int]$Minutes = 30,
  [switch]$Watch
)

$filter = 'resource.type="cloud_run_revision" AND resource.labels.service_name="e-hetsena-api" AND textPayload:"[OTP TEST]"'

function Show-Codes {
  # Windows PowerShell 5.1 retire les guillemets internes passés à un .cmd : on les échappe
  $rows = & gcloud.cmd logging read ($filter -replace '"', '\"') --project=tairoraims --freshness="$($Minutes)m" --limit=20 `
    --format='value(timestamp.date(format="%H:%M:%S", tz=LOCAL),textPayload)'
  if (-not $rows) {
    Write-Host "Aucun code sur les $Minutes dernières minutes." -ForegroundColor Yellow
    return
  }
  foreach ($row in $rows) {
    $time, $text = $row -split "`t", 2
    if ($text -match '\[OTP TEST\] (\S+) => (\d{6})') {
      Write-Host ("{0}  {1}  " -f $time, $Matches[1]) -NoNewline
      Write-Host $Matches[2] -ForegroundColor Green
    }
  }
}

if ($Watch) {
  while ($true) {
    Clear-Host
    Write-Host "Codes OTP e-hetsena (Ctrl+C pour quitter)`n" -ForegroundColor Cyan
    Show-Codes
    Start-Sleep -Seconds 5
  }
} else {
  Show-Codes
}
