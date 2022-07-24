


var  output = "opensubtitles.com Search"
var item = 0
var data 
var id
var path
var filename
mp.msg.info("filename:"+mp.last_error())

var credentials = {
    "username": "abraham",
    "password": "password1", 
    "consumerkey": "FAKEYFAKEY",
    "token": ''
}

function login() {
        
        mp.add_key_binding("n", "next", next)
        mp.add_key_binding("d", "download", download)
        item = 0
        mp.osd_message(output)
        logindetails  = { args :["powershell.exe", "-executionpolicy",  "remotesigned", "-File", "C:\\mpv\\portable_config\\scripts\\login.ps1", credentials.consumerkey, credentials.username, credentials.password]}
        logindata = mp.utils.subprocess(logindetails)
        s = JSON.parse(logindata.stdout)
        credentials.token = s["token"]
        mp.osd_message("logged in: "+credentials.token, 50000)
        fetch()
}

function fetch() {
    filename = mp.get_property('filename')
    path = mp.get_property("path")
    mp.msg.info("filename:"+mp.last_error())
    mp.osd_message("gettings subs..."+credentials.token, 50000)
    fetdetails  = { args :["powershell.exe", "-executionpolicy",  "remotesigned", "-File", "C:\\mpv\\portable_config\\scripts\\fetch.ps1", credentials.consumerkey, credentials.token, path, filename]}
    fetchdata = mp.utils.subprocess(fetdetails)
    data = JSON.parse(fetchdata.stdout)
    next()
}

function next() {
    id = data["data"][item]['attributes']['subtitle_id']
    filename = data["data"][item]['attributes']['files'][0]['file_name']
    subname = filename+" ("+id+")"
    mp.osd_message(subname, 300)
    item++
}

function download() {
    
 }

KEYBING = "ctrl+shift+o"
mp.add_key_binding(KEYBING, "login", login)


