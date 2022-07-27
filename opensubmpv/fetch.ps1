$consumerkey = $args[0]
$jwt = $args[1]
$full_file_path = $args[2]
$filename = $args[3]



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


$moviehash = MovieHash $full_file_path

$query = $filename -replace '\[|\]', '' -replace '\s', '+'

$header = @{
	"Accept" = "*/*"
	"User-Agent" = "poop"
	"Content-Type"="application/json"
	"Api-Key"=$consumerkey
	"Authorization" = "Bearer "+$jwt
	
	}



$url = "https://api.opensubtitles.com/api/v1/subtitles?"+"moviehash="+$moviehash+"&query="+$query


(Invoke-WebRequest -Method GET -Uri $url -Headers $header).Content