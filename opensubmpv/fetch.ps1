$consumerkey = $args[0]
$jwt = $args[1]
$file_path = $args[2]
#$filename = $args[3]

$header = @{
"Accept" = "*/*"
"User-Agent" = "poop"
"Api-Key"=$consumerkey
"Content-Type"="application/json"
"Authorization" = "Bearer "+$jwt

}





$dataLength = 65536

function LongSum([UInt64]$a, [UInt64]$b) { 
	[UInt64](([Decimal]$a + $b) % ([Decimal]([UInt64]::MaxValue) + 1)) 
}

function StreamHash([IO.Stream]$stream) {
	$hashLength = 8
	[UInt64]$lhash = 0
	[byte[]]$buffer = New-Object byte[] $hashLength
	$i = 0
	while ( ($i -lt ($dataLength / $hashLength)) -and ($stream.Read($buffer,0,$hashLength) -gt 0) ) {
		$i++
		$lhash = LongSum $lhash ([BitConverter]::ToUInt64($buffer,0))
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



$moviehash = MovieHash $path
$url = "https://stoplight.io/mocks/opensubtitles/opensubtitles-api/2781383/subtitles?"+"moviehash="+$moviehash+"&query="+$file_path 
(Invoke-WebRequest -Method GET -Uri $url -Headers $header).Content