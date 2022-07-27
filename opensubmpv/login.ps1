$consumerkey = $args[0]
$username = $args[1]
$password = $args[2]

$body = @{
 "username"= $username
 "password"= $password
} | ConvertTo-Json

$header = @{
"Api-Key"=$consumerkey
"Content-Type"="application/json"
}
$url = "https://api.opensubtitles.com/api/v1/login"
(Invoke-WebRequest -Method POST -Uri $url -Body $body -Headers $header).Content
