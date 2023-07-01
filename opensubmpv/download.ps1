$o  = $args[0] | ConvertFrom-Json

$consumerkey = $o.consumerkey
$jwt = $o.token
$full_file_path = $o.filepath
$fileid = $o.file_id
$title = $o.title
$toTemp = $o.toTemp

$headers = @{
	"Accept"        = "*/*"
	"User-Agent"    = "opensubmpv"
	"Api-Key"       = $consumerkey
	"Content-Type"  = "application/json"
	"Authorization" = "Bearer " + $jwt
} 


$body = @{
	"file_id" = [int]$fileid
} | ConvertTo-Json

$NewName = $title + "." + $fileid + ".srt"
$NewName = $NewName.Split([IO.Path]::GetInvalidFileNameChars()) -join ''

if($full_file_path -match '^http' -or $toTemp){
	$file_path = ($env:temp)
} else {
	$file_path = [System.IO.Path]::GetDirectoryName($full_file_path)
}

$newfile = Join-Path $file_path $NewName
	
try {

	$url = "https://api.opensubtitles.com/api/v1/download"
	$response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body 
	$link = $response.link 
	try {
		try {
			$tempFile = New-TemporaryFile
		}
		catch {
			$tempFile = Get-Item ([System.IO.Path]::GetTempFilename())
		}
		
		(Invoke-WebRequest $link).Content | Out-File -FilePath ($tempFile)
	}
	catch {
		Write-Output @{
			'description' = $_
			'error'       = $_.Exception.Response.StatusCode 
			"details"     = $_.Exception
	 } | ConvertTo-Json
		
		return
	}
}
catch {
	Write-Output @{
		'description' = "API Error"
		'error'       = $_.Exception.Message
		"details"     =$_.Exception
 } | ConvertTo-Json
	
	return
}

try {
	
	Copy-Item -Force -LiteralPath $tempFile -Destination $newfile -ErrorAction Stop
	$msg = "sub loaded..."
} catch {
	
	$TMPpath = ($env:temp)
	$newfile = Join-Path $TMPpath $NewName
	Move-Item -Force -LiteralPath $tempFile  $newfile
	$msg = "permission problem...loading from temp"
}

Write-Output @{
	"msg"      = $msg
	"tmp_path" = $newfile
} | ConvertTo-Json
return