# opensubmpv
opensubtitles.com mpv downloader

Finds subtitles from opensubtitles.com and presents each on the OSD for the user to select and download. 

Will attempt to use the embedded title first and then fallback to the filename if it doesn't exist. 
It will download the sub to the same directory as the video and load. 
If it can't write to that directory it will load the sub from temp. 
Will also work with http streams (as long as there is a embedded title).

"advanced search" will allow the user to overide the search params.

Requirements:

* powershell. 5.1+ (All recent versions will work). 
* mpv compiled with js support (most packages have this by default)

Install: 
1. Move the folder "opensubmpv" into your scripts folder.
2. Fill in credentials.js (consumer key and account can be obtained: https://www.opensubtitles.com/consumers)
3. Customise settings.js to your liking.

run:
* ctrl-shift-o
  
Mininal Interface: 
![Yi Yi](Screenshot_1.png?raw=true "Yi Yi Mcdonalds scene")
Manual Search Override: (Work in progress)
![Yi Yi](Screenshot_3.png?raw=true "Yi Yi Mcdonalds scene")
Full Interface: 
![Yi Yi](Screenshot_2.png?raw=true "Yi Yi Mcdonalds scene")
