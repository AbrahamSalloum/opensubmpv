# opensubmpv
opensubtitles.com mpv selecter & downloader

This finds subtitles from opensubtitle.com and presents each on OSD for user to select and download. 
It will download the sub  to the same directory as the video and load. If it can't write to that folder it will load the sub from temp

requirements:
* powershell 5.1 (older/newer may work idk)
* mpv

Install: 
1. move the folder "opensubmpv" into your scripts folder 
2.  fill in credentials.js (consumer key and account can be obtained: https://www.opensubtitles.com/consumers)

run:
ctrl-shift o 

![screenshot](screenshot.png?raw=true "screenshot")

Todo:
probably dont need to login each time

