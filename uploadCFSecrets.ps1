$envFile = ".env"

if (-Not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found at $envFile"
    exit
}

# Read secrets
$lines = Get-Content $envFile
$secrets = @{}

foreach ($line in $lines) {
    if ($line -match '^\s*#') { continue }  # Skip comments
    if ($line -match '^\s*$') { continue }  # Skip empty lines
    if ($line -match '^(.*?)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $secrets[$key] = $value
    }
}

# Upload each secret
foreach ($key in $secrets.Keys) {
    Write-Host "Uploading $key..."

    $value = $secrets[$key]

    # Pipe the value to Wrangler properly
    $value | pnpm wrangler secret put $key

    Start-Sleep -Milliseconds 400  # Avoid Windows async crash
}

Write-Host "All secrets uploaded to Cloudflare Workers successfully."
