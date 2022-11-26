Add-Type -AssemblyName System.Web

$o = $args[0] | ConvertFrom-Json
$consumerkey = $o.consumerkey
$jwt = $o.token
$full_file_path = $o.filepath
$header = @{
	"Accept"        = "*/*"
	"User-Agent"    = "opensubmpv"
	"Content-Type"  = "application/json"
	"Api-Key"       = $consumerkey
	"Authorization" = "Bearer " + $jwt
	
}

$filename = [System.IO.Path]::GetFileNameWithoutExtension($full_file_path).ToLower() 
$nvCollection = [System.Web.HttpUtility]::ParseQueryString([String]::Empty)
$nvCollection.Add('filename', $filename)  

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