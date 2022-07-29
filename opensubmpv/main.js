KEYBINDING = "ctrl+shift+o"
mp.add_key_binding(KEYBINDING, "login", login)
languages = "en" //"en,fr,ar"
var credentials = require('./credentials')
order_by = "moviehash,all"

function printoverlay(toprint, opt) {
    s = ""
    if (!!opt && !!opt.append) s = ov.data
    for (var d = 0; d < toprint.length; d++) {
        for (var i = 0; i < toprint[d].length; i++) {
            s += "{\\fscx60}{\\fscy60}" + toprint[d][i] + "\\h"
        }
        s += '\n'
    }
    ov.data = s
    ov.update(s)
}

function login() {
    item = 0
    scriptpath = mp.get_script_directory()
    ov = mp.create_osd_overlay("ass-events")

    output = [["{\\an5}{\\b1}", "Opensubtitle Search...logging in"]]
    printoverlay(output)
    logindetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", scriptpath + "\\login.ps1", credentials.consumerkey, credentials.username, credentials.password] }
    logindata = mp.utils.subprocess(logindetails)
    s = JSON.parse(logindata.stdout)
    if(s.status !== 200){
        mp.osd_message(JSON.stringify(s), 30)
        exit() 
        return

    }
    credentials.token = s["token"]
    output = [["{\\an5}{\\b1}", "Logged in as userid:", s["user"]["user_id"], "(" + s["user"]["level"] + ")...searching"]]
    printoverlay(output)

    filepath = mp.get_property("path")
    duration_in_seconds = mp.get_property("duration")
    // if(duration_in_seconds >= 4500) { //1.25 hours
    //     order_by = "moviehash,movie"
    // }
    fetch()
}

function fetch() {

    fetchdetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", scriptpath + "\\fetch.ps1", credentials.consumerkey, credentials.token, filepath, languages] }
    fetchdata = mp.utils.subprocess(fetchdetails)
    data = JSON.parse(fetchdata.stdout)
    if(!!data.error){
        mp.osd_message(JSON.stringify(data), 30)
        exit() 
        return
    }
    mp.add_key_binding("n", "next", next)
    mp.add_key_binding("p", "previous", previous)
    mp.add_key_binding("d", "download", download)
    mp.add_key_binding("e", "exit", exit)
    DrawOSD()
}

function formatBooleans(isbool) {
    return isbool ? '{\\1c&H00FF00&}' + isbool + '{\\1c}' : isbool
}

function DrawOSD() {
    if(!!data == false || data["data"].length == 0) {
        mp.osd_message("No Results Found...", 30)
        exit() 
        return 
    }
    id = data["data"][item]['attributes']['files'][0]["file_id"]
    filename_sub = data["data"][item]['attributes']['files'][0]['file_name']
    uploaded_name = data["data"][item]['attributes']['uploader']["name"]
    ismoviehash_match = data["data"][item]['attributes']["moviehash_match"]
    uploader_rank = data["data"][item]['attributes']['uploader']["rank"]
    feature_title = data["data"][item]['attributes']['feature_details']['title']
    feature_year = data["data"][item]['attributes']['feature_details']['year']
    feature_type = data["data"][item]['attributes']['feature_details']['feature_type']
    sublanguage = data["data"][item]['attributes']['language']

    ishd = data["data"][item]['attributes']["hd"]
    isforeign_parts_only = data["data"][item]['attributes']["foreign_parts_only"]
    ishearing_impired = data["data"][item]['attributes']["hearing_impaired"]

    machine_translated = data["data"][item]['attributes']["hearing_impaired"]
    ai_translated = data["data"][item]['attributes']["ai_translated"]

    var output = [
        ["{\\b1}", (item+1)+'/'+data["data"].length, "{\\b0}"],
        ["{\\b1}", "Subtitle:", "{\\b0}", filename_sub],
        ["{\\b1}", "Moviehash Match:", "{\\b0}", formatBooleans(ismoviehash_match), "{\\b1}", "Sub Language:", "{\\b0}", sublanguage],
        ["{\\b1}", "Uploaded By:", "{\\b0}", uploaded_name, "(" + uploader_rank + ")"],
        ["{\\b1}", "HD:", "{\\b0}", formatBooleans(ishd), "{\\b1}", "Foriegn Parts Only:", "{\\b0}", formatBooleans(isforeign_parts_only), "{\\b1}", "Hearing Impaired:", "{\\b0}", formatBooleans(ishearing_impired)],
        ["{\\b1}", "Title:", "{\\b0}", feature_title],
        ["{\\b1}", "Year:", "{\\b0}", feature_year, "{\\b1}", "Type:", "{\\b0}", feature_type],
    ]

    printoverlay(output)

    sub_rating = data["data"][item]['attributes']['ratings']
    sub_dlcount = data["data"][item]['attributes']['download_count']
    sub_points = data["data"][item]['attributes']['points']
    sub_votes = data["data"][item]['attributes']['votes']

    output = [
        ["{\\b1}", "Sub Rating:", "{\\b0}", sub_rating,
            "{\\b1}", "Downloads:", "{\\b0}", sub_dlcount,
            "{\\b1}", "Votes:", "{\\b0}", sub_votes]
    ]

    printoverlay(output, { append: true })

    entry = []
    if(machine_translated) entry.push("{\\b1}", "Machine Translated:", "{\\b0}", formatBooleans(machine_translated))
    if(ai_translated) entry.push("{\\b1}", "AI Translated:","{\\b0}", formatBooleans(ai_translated))
    output = [entry]
    printoverlay(output, { append: true })

    output = [["{\\an2}",
        "{\\b1}{\\1c&H0000FF&}", "d{\\1c}{\\b0}ownload and load",
        "{\\b1}{\\1c&H0000FF&}", "n{\\1c}{\\b0}ext",
        "{\\b1}{\\1c&H0000FF&}", "p{\\1c}{\\b0}revious",
        "{\\b1}{\\1c&H0000FF&}", "e{\\1c}{\\b0}xit"
    ]]

    printoverlay(output, { append: true })
}

function next() {
    item++
    if (item < data['data'].length) {
        DrawOSD()
        return
    } item = data['data'].length
}

function previous() {
    item--
    if (item >= 0) {
        DrawOSD()
        return
    } item = 0
}

function download() {

    output = [["{\\an5}", "downloading..."]]
    printoverlay(output, { append: true })
    fetchdetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", scriptpath + "\\download.ps1", credentials.consumerkey, credentials.token, filepath, id.toString()] }
    fetchsub = mp.utils.subprocess(fetchdetails)
    dlinfo = JSON.parse(fetchsub.stdout)
    if(!!dlinfo.error){
        mp.osd_message(JSON.stringify(dlinfo), 30)
        exit() 
        return
    }

    if(!!dlinfo.msg){
        mp.osd_message(JSON.stringify(dlinfo.msg))
        mp.commandv("sub-add", dlinfo.tmp_path)
    }
    
    mp.set_property('sub-auto', 'all')
    mp.commandv('rescan_external_files','reselect')
    DrawOSD()
}

function exit() {
    ov.remove()
    mp.remove_key_binding("next")
    mp.remove_key_binding("previous")
    mp.remove_key_binding("download")
    mp.remove_key_binding("exit")
}
