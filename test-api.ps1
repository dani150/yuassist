$body = @{chatInput='hello'} | ConvertTo-Json

# Test 1: GET (should return 405 "Method not allowed")
Write-Host "=== TEST 1: GET (expect 405) ==="
try {
    $r = Invoke-WebRequest -Uri 'https://yuassist.vercel.app/api/chat-proxy' -Method GET -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode)"
    Write-Host "BODY: $($r.Content)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "STATUS: $statusCode"
    Write-Host "BODY: $responseBody"
}

# Test 2: POST with valid body (the real test)
Write-Host ""
Write-Host "=== TEST 2: POST with chatInput ==="
try {
    $r = Invoke-WebRequest -Uri 'https://yuassist.vercel.app/api/chat-proxy' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode)"
    Write-Host "BODY: $($r.Content)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "STATUS: $statusCode"
    Write-Host "BODY: $responseBody"
}
