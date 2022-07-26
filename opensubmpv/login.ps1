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
$url = "https://stoplight.io/mocks/opensubtitles/opensubtitles-api/2781383/login"
(Invoke-WebRequest -Method POST -Uri $url -Body $body -Headers $header).Content
