Add-Type -AssemblyName System.Web

$consumerkey = $args[0]
$jwt = $args[1]
$full_file_path = $args[2]


$header = @{
	"Accept"        = "*/*"
	"User-Agent"    = "poop"
	"Content-Type"  = "application/json"
	"Api-Key"       = $consumerkey
	"Authorization" = "Bearer " + $jwt
	
}

$filename = [System.IO.Path]::GetFileNameWithoutExtension($full_file_path).ToLower() 

$nvCollection = [System.Web.HttpUtility]::ParseQueryString([String]::Empty)
$nvCollection.Add('filename',$filename)  # $folderName+" "


$uriRequest = [System.UriBuilder]'https://api.opensubtitles.com/api/v1//utilities/guessit'
$uriRequest.Query = $nvCollection.ToString()

$url = $uriRequest.Uri.OriginalString
  
try {

	$response = (Invoke-RestMethod -Uri $url.ToLower() -Method GET -Headers $header)

}
catch {
	Write-Output @{
		'error'   = $_.Exception.Response.StatusCode 
		"details" = $_.Exception.Response
 } | ConvertTo-Json
	
	return 
}


Write-Output $response | ConvertTo-Json -Depth 100