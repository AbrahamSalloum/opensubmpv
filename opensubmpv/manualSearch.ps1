[void][Reflection.Assembly]::LoadWithPartialName('Microsoft.VisualBasic')

$title = 'Manual Search'
$msg   = 'Enter Title, Year, Episode Number etc:'

$searchtext = [Microsoft.VisualBasic.Interaction]::InputBox($msg, $title)
Write-Output @{
    "title" = $searchtext
} | ConvertTo-Json