KEYBINDING = "ctrl+shift+o"
var credentials = {
    "username": "abraham",
    "password": "superman1",
    "consumerkey": "FAKEYFAKEY1",
    "token": ''
}

function printoverlay(toprint, opt) {
    s = ""
    if(!!opt && !!opt.append) s = ov.data
    for(var d = 0; d < toprint.length; d++){
        for(var i =0; i < toprint[d].length; i++) {
            s +=  "{\\fscx60}{\\fscy60}"+toprint[d][i]+"\\h"
        }
    s += '\n'
}
ov.data = s
ov.update(s)
}

function login() {
    item = 0
    scriptpath = mp.get_script_directory()
    
    mp.add_key_binding("n", "next", next)
    mp.add_key_binding("p", "previous", previous)
    mp.add_key_binding("d", "download", download)
    ov = mp.create_osd_overlay("ass-events")
    
    output = [["{\\an5}{\\b1}", "Opensubtitle Search"]]
    printoverlay(output)
    logindetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", scriptpath+"\\login.ps1", credentials.consumerkey, credentials.username, credentials.password] }
    logindata = mp.utils.subprocess(logindetails)
    s = JSON.parse(logindata.stdout)
    credentials.token = s["token"]
    output = [["{\\an5}{\\b1}", "Logged in as userid:", s["user"]["user_id"], "("+s["user"]["level"] +")"]]
    printoverlay(output)
    fetch()
}

function fetch() {
    filename = mp.get_property('filename')
    path = mp.get_property("path")
    fetchdetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", scriptpath+"\\fetch.ps1", credentials.consumerkey, credentials.token, path] }
    fetchdata = mp.utils.subprocess(fetchdetails)
    data = JSON.parse(fetchdata.stdout)
    DrawOSD()
}

function DrawOSD() {
    id = data["data"][item]['attributes']['subtitle_id']
    filename_sub = data["data"][item]['attributes']['files'][0]['file_name']
    uploaded_name = data["data"][item]['attributes']['uploader']["name"]
    uploader_rank = data["data"][item]['attributes']['uploader']["rank"]
    feature_title = data["data"][item]['attributes']['feature_details']['title']
    feature_year = data["data"][item]['attributes']['feature_details']['year']
    feature_type =  data["data"][item]['attributes']['feature_details']['feature_type']
    sublanguage = data["data"][item]['attributes']['language']

    var output = [
    ["{\\b1}", "Subtitle:", "{\\b0}", filename_sub], 
    ["{\\b1}", "Uploaded By:", "{\\b0}", uploaded_name, "("+uploader_rank+")"], 
    ["{\\b1}", "Movie Title:", "{\\b0}", feature_title], 
    ["{\\b1}", "Sub Language:", "{\\b0}", sublanguage],
    ["{\\b1}", "Year:", "{\\b0}", feature_year], 
    ["{\\b1}", "Type:", "{\\b0}", feature_type],
    
    ]
    printoverlay(output)

    sub_rating = data["data"][item]['attributes']['ratings']
    sub_dlcount = data["data"][item]['attributes']['download_count']
    sub_points = data["data"][item]['attributes']['points']
    sub_votes = data["data"][item]['attributes']['votes']
    
    output = [
    ["{\\b1}", "Rating:", "{\\b0}", sub_rating,
     "{\\b1}", "Downloads:", "{\\b0}", sub_dlcount,
     "{\\b1}", "Points:", "{\\b0}", sub_points,
     "{\\b1}", "Votes:", "{\\b0}", sub_votes]
    ]

    printoverlay(output, {append:true})
    output = [["{\\an2}", "{\\b1}{\\1c&H&fff}",  "d{\\1c}{\\b0}ownload and load",
               "{\\b1}{\\1c&H&fff}",  "n{\\1c}{\\b0}ext",
               "{\\b1}{\\1c&H&fff}",  "p{\\1c}{\\b0}revious"]]

    printoverlay(output, {append:true})
}

function next(){
    item++
    if(item < data['data'].length){
        DrawOSD()
        return
    }
    item = data['data'].length 
}

function previous(){
    item--
    if(item >=0){
        DrawOSD()
        return
    }
    item = 0
        
}

function download() {
    fetchdetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", scriptpath+"\\download.ps1", credentials.consumerkey, credentials.token, path, filename, fileid] }
    return 
}


mp.add_key_binding(KEYBINDING, "login", login)