$consumerkey = $args[0]
$jwt = $args[1]
# $file_path = $args[2]
# $filename = $args[3]
$fileid = $args[4]

$headers = @{
	"Api-Key"       = $consumerkey
	"Content-Type"  = "application/json"
	"Authorization" = "Bearer " + $jwt
} 

$body = @{
	"file_id" = $fileid
} | ConvertTo-Json

#    echo $body
$ask = '{"file_id":'+ $fileid +'}'

  echo $ask

$url = "https://stoplight.io/mocks/opensubtitles/opensubtitles-api/2781383/download"
$response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $ask

 $link = $response.link
 echo $link
#echo $jsondownlaod | ConvertTo-Json

Invoke-WebRequest -Uri $link -OutFile "C:\\Users\\Abraham\\Desktop\\test.srt"



#echo $jsondownlaod.link