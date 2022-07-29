$consumerkey = $args[0]
$jwt = $args[1]
$full_file_path = $args[2]
$fileid = [int]$args[3]



$file_path = [System.IO.Path]::GetDirectoryName($full_file_path)
$filename = [System.IO.Path]::GetFileName($full_file_path)



$headers = @{
	"Accept"        = "*/*"
	"User-Agent"    = "poop"
	"Api-Key"       = $consumerkey
	"Content-Type"  = "application/json"
	"Authorization" = "Bearer " + $jwt
} 

$body = @{
	"file_id" = $fileid
} | ConvertTo-Json

$url = "https://api.opensubtitles.com/api/v1/download"

$NewName = $filename + "." + $fileid + ".srt"

$newfile = Join-Path $file_path $NewName

try {
	$response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
	try {
		$link = $response.link
		(Invoke-WebRequest $link).Content | Out-File -FilePath ($tempFile = New-TemporaryFile)
		

	}
	catch {
		Write-Output @{
			'description' = "Download Error"
			'error'       = $_.Exception.Response.StatusCode 
			"details"     = $_.Exception.Response
	 } | ConvertTo-Json
		
		return
	}
}
catch {
	Write-Output @{
		'description' = "API Error"
		'error'       = $_.Exception.Response.StatusCode 
		"details"     = $_.Exception.Response
 } | ConvertTo-Json
	
	return
}

try {
	Copy-Item -Force -LiteralPath $tempFile -Destination $newfile -ErrorAction Stop
	Write-Output $response | ConvertTo-Json -Depth 100
}
catch {
	
	$TMPpath = ($env:temp)
	$p = Join-Path $TMPpath $NewName

	if (Test-Path -LiteralPath $p) {
		$random = Get-Random
		Rename-Item -LiteralPath $p -NewName ($NewName + "." + $random + ".srt")
		
	}
	Rename-Item -Force -LiteralPath $tempFile -NewName $NewName 
	Write-Output @{
		"msg"      = "permission problem...loading from temp"
		"tmp_path" = $p
	} | ConvertTo-Json
 
}