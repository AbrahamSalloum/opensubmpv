Add-Type -AssemblyName System.Web

$o  = $args[0] | ConvertFrom-Json

$consumerkey = $o.consumerkey
$jwt = $o.token
$full_file_path = $o.filepath
$languages = $o.languages
$options = $o.options


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
	#$hash = ''
	
} else {
	#$filename = [System.IO.Path]::GetFileNameWithoutExtension($full_file_path).ToLower()
	$moviehash = MovieHash $full_file_path
	$hash = $moviehash.PadLeft(16, '0')
}

# $moviehash = MovieHash $full_file_path
# $hash = $moviehash.PadLeft(16, '0')

$header = @{
	"Accept"        = "*/*"
	"User-Agent"    = "opensubmpv"
	"Content-Type"  = "application/json"
	"Api-Key"       = $consumerkey
	"Authorization" = "Bearer " + $jwt
	
}

$nvCollection = [System.Web.HttpUtility]::ParseQueryString([String]::Empty)

if ($options.title) {
	$nvCollection.Add('query', $options.title)
}

if($hash){
	$nvCollection.Add('moviehash', $hash)
}


if ($options.year) {
	$nvCollection.Add('year', $options.year)
}

$nvCollection.Add('languages', $languages)
$nvCollection.Add('type', "All")

$uriRequest = [System.UriBuilder]'https://api.opensubtitles.com/api/v1/subtitles'
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