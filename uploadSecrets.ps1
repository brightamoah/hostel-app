$repo = "brightamoah/hostel-app"
$envFile = ".env"

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^(.*?)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        if ($key -and $value) {
            Write-Host "Uploading $key..."
            gh secret set $key --repo $repo --body $value
        }
    }
}

Write-Host "All secrets uploaded to $repo successfully."
