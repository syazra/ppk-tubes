$ErrorActionPreference = 'Stop'
$auditRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$auditPublic = Join-Path $auditRoot 'public'
$auditRouter = Join-Path $auditRoot 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php'
$auditMarker = 'Synthetic security audit marker ' + [guid]::NewGuid().ToString('N')
$auditFilename = 'security-audit-' + [guid]::NewGuid().ToString('N') + '.txt'
$auditPaths = @()
$auditServer = $null
$auditResults = @()

try {
    foreach ($auditKind in @('proposals', 'reports')) {
        $auditDirectory = Join-Path $auditRoot ('storage/app/public/' + $auditKind)
        [IO.Directory]::CreateDirectory($auditDirectory) | Out-Null
        $auditPath = Join-Path $auditDirectory $auditFilename
        [IO.File]::WriteAllText($auditPath, $auditMarker)
        $auditPaths += $auditPath
    }

    $auditListener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $auditListener.Start()
    $auditPort = $auditListener.LocalEndpoint.Port
    $auditListener.Stop()
    $auditServer = Start-Process -FilePath (Get-Command php).Source -ArgumentList @(
        '-S', ('127.0.0.1:' + $auditPort), '-t', $auditPublic, $auditRouter
    ) -WorkingDirectory $auditPublic -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $PSScriptRoot 'http-probe-stdout.log') `
        -RedirectStandardError (Join-Path $PSScriptRoot 'http-probe-stderr.log')

    foreach ($auditKind in @('proposals', 'reports')) {
        $auditResponse = $null
        for ($auditAttempt = 0; $auditAttempt -lt 10; $auditAttempt++) {
            try {
                # No Cookie, Authorization, or saved session is supplied.
                $auditResponse = Invoke-WebRequest -Uri ('http://127.0.0.1:' + $auditPort + '/storage/' + $auditKind + '/' + $auditFilename) -TimeoutSec 3
                break
            } catch {
                if ($auditAttempt -eq 9) { throw }
                Start-Sleep -Milliseconds 200
            }
        }
        $auditResults += [pscustomobject]@{
            directory = $auditKind
            authenticated = $false
            status = [int]$auditResponse.StatusCode
            markerMatched = $auditResponse.Content.Trim() -eq $auditMarker
        }
    }
    $auditResults | ConvertTo-Json | Tee-Object -FilePath (Join-Path $PSScriptRoot 'http-probe-results.json')
} finally {
    if ($auditServer -and -not $auditServer.HasExited) { Stop-Process -Id $auditServer.Id }
    foreach ($auditPath in $auditPaths) {
        if (Test-Path -LiteralPath $auditPath) { Remove-Item -LiteralPath $auditPath }
    }
}
