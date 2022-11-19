$o = $args[0] | ConvertFrom-Json

$consumerkey = $o.consumerkey
$username = $o.username
$password = $o.password

$body = @{
    "username" = $username
    "password" = $password
} | ConvertTo-Json

$header = @{
    "Api-Key"      = $consumerkey
    "Content-Type" = "application/json"
}
$url = "https://api.opensubtitles.com/api/v1/login"

try {
    $response = Invoke-RestMethod -Method POST -Uri $url -Body $body -Headers $header  -ErrorVariable $RespErr;
}
catch {
    Write-Output $_.ErrorDetails.Message
    return
}

Write-Output $response | ConvertTo-Json -Depth 100