Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
# $objIcon = New-Object system.drawing.icon (".\Designer.ico")

$GreetingLabel = New-Object Windows.Forms.Label
$GreetingLabel.Text = "Media Title"
$GreetingLabel.AutoSize = $true
$GreetingLabel.Location = New-Object Drawing.Point(10,4)
$GreetingLabel.ForeColor = [System.Drawing.Color]::Black

$title = New-Object System.Windows.Forms.textbox
$title.Multiline = $False
$title.Width = 250
$title.Location = new-object System.Drawing.Size(10, 25)


$MediaTypeLabel = New-Object Windows.Forms.Label
$MediaTypeLabel.Text = "Media Type"
$MediaTypeLabel.AutoSize = $true
$MediaTypeLabel.Location = New-Object Drawing.Point(10,54)
$MediaTypeLabel.ForeColor = [System.Drawing.Color]::Black


$type = New-Object system.Windows.Forms.ComboBox
$type.text = ""
$type.autosize = $true
$type.location = New-Object System.Drawing.Size(10, 75)
@("all", "Movie", "Episode", "TV show") | ForEach-Object { [void] $type.Items.Add($_) }
$type.SelectedIndex = 0


$YearLabel = New-Object Windows.Forms.Label
$YearLabel.Text = "Year"
$YearLabel.AutoSize = $true
$YearLabel.Location = New-Object Drawing.Point(10,103)
$YearLabel.ForeColor = [System.Drawing.Color]::Black


$info = New-Object Windows.Forms.Label
$info.Text = "If IMDb/TMDb id is provided 'title' will not be used in the query"
$info.AutoSize = $true
$info.Location = New-Object Drawing.Point(140,75)
$info.ForeColor = [System.Drawing.Color]::Black

$year = New-Object System.Windows.Forms.textbox
$year.Multiline = $False
$year.Size = New-Object System.Drawing.Size(100, 135)
$year.Location = New-Object System.Drawing.Size(10, 125)


$ImdbLabel = New-Object Windows.Forms.Label
$ImdbLabel.Text = "IMDb ID"
$ImdbLabel.AutoSize = $true
$ImdbLabel.Location = New-Object Drawing.Point(175,103)
$ImdbLabel.ForeColor = [System.Drawing.Color]::Black

$imdb = New-Object System.Windows.Forms.textbox
$imdb.Multiline = $False
$imdb.Size = New-Object System.Drawing.Size(100, 100)
$imdb.Location = New-Object System.Drawing.Size(175, 125)

$TmdbLabel = New-Object Windows.Forms.Label
$TmdbLabel.Text = "TMDb ID"
$TmdbLabel.AutoSize = $true
$TmdbLabel.Location = New-Object Drawing.Point(340,103)
$TmdbLabel.ForeColor = [System.Drawing.Color]::Black

$tmdb = New-Object System.Windows.Forms.textbox
$tmdb.Multiline = $False
$tmdb.Size = New-Object System.Drawing.Size(100, 100)
$tmdb.Location = New-Object System.Drawing.Size(340, 125)

$CreateButton = New-Object System.Windows.Forms.Button
$CreateButton.Location = New-Object System.Drawing.Size (275, 25)
$CreateButton.BackColor = "LightGray"
$CreateButton.Text = "Search"
$CreateButton.Add_Click({

		[String]$q = $title.Text
		[String]$y = $year.Text
		[String]$i = $imdb.Text
		[String]$t = $tmdb.Text
		$Index = [String]$type.SelectedIndex
		[String]$m = $type.Items[$Index]

		$x = @{
			"title" = $q
			"year"  = $y
			"imdb"  = $i
			"tmdb"  = $t
			"type"  = $m
		} | ConvertTo-Json

		$Form.Close()
		Write-Host $x 

	})

$Form = New-Object Windows.Forms.Form
$Form.Text = "Advanced Subtitle Search"
$Form.Size = New-Object System.Drawing.Size(500, 200) 
$Form.KeyPreview = $True
# $Form.Icon = $objIcon 
$Form.Topmost = $True
$Form.Controls.add($GreetingLabel)
$Form.Controls.add($title)
$Form.Controls.add($MediaTypeLabel)
$Form.Controls.add($type)
$Form.Controls.add($YearLabel)
$Form.Controls.add($year)
$Form.Controls.add($ImdbLabel)
$Form.Controls.add($info)
$Form.Controls.add($imdb)
$Form.Controls.add($TmdbLabel)
$Form.Controls.add($tmdb)
$Form.Controls.add($CreateButton)
$Form.Add_Shown({ $Form.Activate() })
$Form.ShowDialog() | Out-Null