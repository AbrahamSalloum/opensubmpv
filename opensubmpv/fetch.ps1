Add-Type -AssemblyName System.Web

$o  = $args[0] | ConvertFrom-Json
$consumerkey = $o.consumerkey
$jwt = $o.token
$full_file_path = $o.filepath
$languages = $o.languages
$options = $o.options
$allowMachineTrans = $o.allowMachineTrans
$allowAItrans = $o.allowAItranslations

$dataLength = 65536

function LongSum([UInt64]$a, [UInt64]$b) { 
	[UInt64](([Decimal]$a + $b) % ([Decimal]([UInt64]::MaxValue) + 1)) 
}

function StreamHash([IO.Stream]$stream) {
	$hashLength = 8
	[UInt64]$lhash = 0
	[byte[]]$buffer = New-Object byte[] $hashLength
	$i = 0
	while ( ($i -lt ($dataLength / $hashLength)) -and ($stream.Read($buffer, 0, $hashLength) -gt 0) ) {
		$i++
		$lhash = LongSum $lhash ([BitConverter]::ToUInt64($buffer, 0))
	}
	$lhash
}

function MovieHash([string]$path) {
	try { 
		$stream = [IO.File]::OpenRead($path) 
		[UInt64]$lhash = $stream.Length
		$lhash = LongSum $lhash (StreamHash $stream)
		$stream.Position = [Math]::Max(0L, $stream.Length - $dataLength)
		$lhash = LongSum $lhash (StreamHash $stream)
		"{0:X}" -f $lhash
	}
	finally { $stream.Close() }
}



if($full_file_path -match '^http'){
	
	
} else {
	$moviehash = MovieHash $full_file_path
	$hash = $moviehash.PadLeft(16, '0')
}

$header = @{
	"Accept"        = "*/*"
	"User-Agent"    = "opensubmpv"
	"Content-Type"  = "application/json"
	"Api-Key"       = $consumerkey
	"Authorization" = "Bearer " + $jwt
	
}

$nvCollection = [System.Web.HttpUtility]::ParseQueryString([String]::Empty)


if ($options.title -and [string]::IsNullOrEmpty($options.imdb) -and [string]::IsNullOrEmpty($options.tmdb)) {
	$nvCollection.Add('query', $options.title)
}

if (-not [string]::IsNullOrEmpty($options.imdb)) {
	$nvCollection.Add('imdb_id', $options.imdb)
}

if (-not  [string]::IsNullOrEmpty($options.tmdb)) {
	$nvCollection.Add('tmdb_id', $options.tmdb)
}

if (-not [string]::IsNullOrEmpty($options.year)) {
	$nvCollection.Add('year', $options.year)
}




if (-not [string]::IsNullOrEmpty($options.type)) {
	$nvCollection.Add('type', $options.type)
} else {
	$nvCollection.Add('type', "all")
}


if($options.advancedSearch -ne "true"){
	if($hash) {
		$nvCollection.Add('moviehash', $hash)
	}
	
}


$nvCollection.Add('languages', $languages)
$nvCollection.Add('machine_translated', $allowMachineTrans)
$nvCollection.Add('ai_translated', $allowAItrans)

$uriRequest = [System.UriBuilder]'https://api.opensubtitles.com/api/v1/subtitles'
$uriRequest.Query = $nvCollection.ToString().ToLower()

$url = $uriRequest.Uri.OriginalString
Write-Output $uriRequest.Query | Out-File -FilePath C:\mpv\aaa.txt
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