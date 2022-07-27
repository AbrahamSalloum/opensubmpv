$consumerkey = $args[0]
$jwt = $args[1]
$file_path = $args[2]
$filename = $args[3]
$fileid = [int]$args[4]


$headers = @{
	"Accept" = "*/*"
	"User-Agent" = "poop"
	"Api-Key"       = $consumerkey
	"Content-Type"  = "application/json"
	"Authorization" = "Bearer " + $jwt
} 

$body = @{
	"file_id" = $fileid
} | ConvertTo-Json

$url = "https://api.opensubtitles.com/api/v1/download"

$newfile = $file_path + $filename+"."+$fileid+".srt"
 

$response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
$link = $response.link





Invoke-WebRequest $link | Out-File -FilePath ($tempFile = New-TemporaryFile)
Copy-Item -Force -LiteralPath $tempFile -Destination $newfile
Write-Output $response | ConvertTo-Json
