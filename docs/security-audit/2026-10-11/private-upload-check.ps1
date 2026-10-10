$ErrorActionPreference = 'Stop'
$checkRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$checkPublic = Join-Path $checkRoot 'public'
$checkMarker = 'Synthetic private-upload regression marker'
$checkName = 'security-regression-' + [guid]::NewGuid().ToString('N') + '.txt'
$checkPaths = @()
$checkServer = $null
$checkResults = @()
$checkClient = [Net.Http.HttpClient]::new()
try {
    foreach ($checkKind in @('proposals', 'reports', 'report-images', 'facilities')) {
        $checkDirectory = Join-Path $checkRoot ('storage/app/public/' + $checkKind)
        [IO.Directory]::CreateDirectory($checkDirectory) | Out-Null
        $checkPath = Join-Path $checkDirectory $checkName
        [IO.File]::WriteAllText($checkPath, $checkMarker)
        $checkPaths += $checkPath
    }
    $checkListener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $checkListener.Start()
    $checkPort = $checkListener.LocalEndpoint.Port
    $checkListener.Stop()
    $checkServer = Start-Process -FilePath (Get-Command php).Source -ArgumentList @(
        '-S', ('127.0.0.1:' + $checkPort), '-t', $checkPublic, (Join-Path $checkRoot 'server.php')
    ) -WorkingDirectory $checkPublic -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $checkRoot 'storage/logs/remediation-http-stdout.log') `
        -RedirectStandardError (Join-Path $checkRoot 'storage/logs/remediation-http-stderr.log')
    $checkCases = @(
        @('proposals', '/storage/proposals/', 404),
        @('reports', '/storage/reports/', 404),
        @('report-images', '/storage/report-images/', 404),
        @('encoded-reports', '/storage/%72eports/', 404),
        @('dot-reports', '/storage/./reports/', 404),
        @('facilities', '/storage/facilities/', 200)
    )
    foreach ($checkCase in $checkCases) {
        for ($checkAttempt = 0; $checkAttempt -lt 10; $checkAttempt++) {
            try {
                $checkResponse = $checkClient.GetAsync('http://127.0.0.1:' + $checkPort + $checkCase[1] + $checkName).GetAwaiter().GetResult()
                break
            } catch {
                if ($checkAttempt -eq 9) { throw }
                Start-Sleep -Milliseconds 200
            }
        }
        $checkContent = $checkResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        $checkResults += [pscustomobject]@{
            case = $checkCase[0]
            authenticated = $false
            status = [int]$checkResponse.StatusCode
            expectedStatus = $checkCase[2]
            markerMatched = $checkContent.Trim() -eq $checkMarker
        }
        $checkResponse.Dispose()
    }
    $checkResults | ConvertTo-Json | Set-Content (Join-Path $PSScriptRoot 'remediation-http-results.json')
    $checkResults | Format-Table
    if (@($checkResults | Where-Object { $_.status -ne $_.expectedStatus -or ($_.status -ne 200 -and $_.markerMatched) }).Count -gt 0) {
        throw 'Private upload HTTP regression failed.'
    }
} finally {
    $checkClient.Dispose()
    if ($checkServer -and -not $checkServer.HasExited) { Stop-Process -Id $checkServer.Id }
    foreach ($checkPath in $checkPaths) {
        if (Test-Path -LiteralPath $checkPath) { Remove-Item -LiteralPath $checkPath }
    }
}
