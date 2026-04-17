Add-Type -AssemblyName System.Net.Http

$webhookUrl = 'https://n8n.srv1313035.hstgr.cloud/webhook/e66290dc-41b6-452e-b924-c5883059c517'
$secret = '58f2bc983352da19327ffda64e22e2c2fde0d0d55f6ff84b39422eb59227a57c'

Write-Host "=== Direct POST to n8n with X-Webhook-Secret ==="
$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Add('X-Webhook-Secret', $secret)
$content = New-Object System.Net.Http.StringContent('{"action":"sendMessage","sessionId":"test123","chatInput":"hello"}', [System.Text.Encoding]::UTF8, 'application/json')
$r = $client.PostAsync($webhookUrl, $content).Result
$body = $r.Content.ReadAsStringAsync().Result
Write-Host "STATUS: $([int]$r.StatusCode)"
Write-Host "BODY: $body"
$client.Dispose()
