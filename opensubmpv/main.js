KEYBINDING = "ctrl+shift+o"
mp.add_key_binding(KEYBINDING, "start", start)

languages = "en" //"en,fr,ar"
var credentials = require('./credentials')
var options = {}

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

function authenticate() {

    output = [["{\\an5}{\\b1}", "logging in"]]
    printoverlay(output)
    script = mp.utils.join_path(scriptpath, "login.ps1")
    logindetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", script, credentials.consumerkey, credentials.username, credentials.password] }
    logindata = mp.utils.subprocess(logindetails)
    s = JSON.parse(logindata.stdout)
    if (s.status !== 200) {
        return
    }
    credentials.token = s["token"]
    output = [["{\\an5}{\\b1}", "Logged in as userid:", s["user"]["user_id"], "(" + s["user"]["level"] + ")"]]
    printoverlay(output)
}

function start() {
    mp.register_event("file-loaded", exit)

    item = 0
    login_attempts = 0
    scriptpath = mp.get_script_directory()
    ov = mp.create_osd_overlay("ass-events")
    
    filepath = mp.get_property("path")
    output = [["{\\an5}{\\b1}", "Opensubtitle Searching", "{\\an2}", "{\\b1}{\\1c&H0000FF&}", "e{\\1c}{\\b0}xit"]]
    printoverlay(output)
    mp.add_key_binding("e", "exit", exit)
    fetch()
}


function guessit() {
    output = [["{\\an5}{\\b1}", "trying super hard..."]]
    printoverlay(output)
    script = mp.utils.join_path(scriptpath, "guessit.ps1")
    guessdetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", script, credentials.consumerkey, credentials.token, filepath] }
    runguessit = mp.utils.subprocess(guessdetails)
    guessitdata = JSON.parse(runguessit.stdout)
    if (!!guessitdata.error) {
        mp.osd_message(JSON.stringify(data), 15)
        exit()
        return
    }

    options = {
        year: guessitdata.year,
        type: guessitdata.type,
        title: guessitdata.title,

    }

    fetch()
}

function fetch() {

   
    script = mp.utils.join_path(scriptpath, "fetch.ps1")
    fetchdetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", script, credentials.consumerkey, credentials.token, filepath, languages, JSON.stringify(options)] }
    fetchdata = mp.utils.subprocess(fetchdetails)
    data = JSON.parse(fetchdata.stdout)
    if (!!data.error) {
        mp.osd_message(JSON.stringify(data), 15)
        exit()
        return
    }


    mp.add_key_binding("n", "next", next)
    mp.add_key_binding("p", "previous", previous)
    mp.add_key_binding("d", "download", download)
    mp.add_key_binding("t", "guessit", guessit)
    options = {}
    ov.remove()
    DrawOSD()

}

function formatBooleans(isbool) {
    return isbool ? '{\\1c&H00FF00&}' + isbool + '{\\1c}' : isbool
}

function DrawOSD() {

    if (!!data == false || data["data"].length == 0) {
        output = [["{\\an2}", "No Results Found...", "{\\b1}{\\1c&H0000FF&}", "t{\\1c}{\\b0}ry harder", "{\\b1}{\\1c&H0000FF&}", "e{\\1c}{\\b0}xit"]]

        printoverlay(output, { append: true })
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
        ["{\\b1}", (item + 1) + '/' + data["data"].length, "{\\b0}"],
        ["{\\b1}", "Subtitle:", "{\\b0}", filename_sub],
        ["{\\b1}", "Moviehash Match:", "{\\b0}", formatBooleans(ismoviehash_match), "{\\b1}", "Sub Language:", "{\\b0}", sublanguage],
        ["{\\b1}", "Sub id:", "{\\b0}", id, "{\\b1}", "Uploaded By:", "{\\b0}", uploaded_name, "(" + uploader_rank + ")"],
        ["{\\b1}", "HD:", "{\\b0}", formatBooleans(ishd), "{\\b1}", "Foriegn Parts Only:", "{\\b0}", formatBooleans(isforeign_parts_only), "{\\b1}", "Hearing Impaired:", "{\\b0}", formatBooleans(ishearing_impired)],
        ["{\\b1}", "Title:", "{\\b0}", feature_title],
        ["{\\b1}", "Year:", "{\\b0}", feature_year, "{\\b1}", "Type:", "{\\b0}", feature_type],
    ]

    printoverlay(output)

    sub_rating = data["data"][item]['attributes']['ratings']
    sub_dlcount = data["data"][item]['attributes']['download_count']
    sub_points = data["data"][item]['attributes']['points']
    sub_votes = data["data"][item]['attributes']['votes']

    output = [["{\\b1}", "Sub Rating:", "{\\b0}", sub_rating, "{\\b1}", "Downloads:", "{\\b0}", sub_dlcount, "{\\b1}", "Votes:", "{\\b0}", sub_votes]]

    printoverlay(output, { append: true })

    entry = []
    if (machine_translated) entry.push("{\\b1}", "Machine Translated:", "{\\b0}", formatBooleans(machine_translated))
    if (ai_translated) entry.push("{\\b1}", "AI Translated:", "{\\b0}", formatBooleans(ai_translated))
    output = [entry]
    printoverlay(output, { append: true })

    output = [["{\\an2}", "{\\b1}{\\1c&H0000FF&}", "t{\\1c}{\\b0}ry harder", "{\\b1}{\\1c&H0000FF&}", "{\\b1}{\\1c&H0000FF&}", "d{\\1c}{\\b0}ownload and load", "{\\b1}{\\1c&H0000FF&}", "n{\\1c}{\\b0}ext", "{\\b1}{\\1c&H0000FF&}", "p{\\1c}{\\b0}revious", "{\\b1}{\\1c&H0000FF&}", "e{\\1c}{\\b0}xit"]]

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
    token_file = mp.utils.join_path(scriptpath, "token")
    token = mp.utils.read_file(token_file)
    if (!!token == false) {
        authenticate()
        mp.utils.write_file("file://" + token_file, credentials.token)
        token = credentials.token
    }

    output = [["{\\an5}", "downloading..."]]
    printoverlay(output, { append: true })
    script = mp.utils.join_path(scriptpath, "download.ps1")
    file_id = id.toString().trim()

    fetchdetails = { args: ["powershell.exe", "-executionpolicy", "remotesigned", "-File", script, credentials.consumerkey, token, filepath, file_id] }
    fetchsub = mp.utils.subprocess(fetchdetails)
    dlinfo = JSON.parse(fetchsub.stdout)
    if (!!dlinfo.error) {
        if ((dlinfo.error == 403 || dlinfo.error == 401) && login_attempts <= 1) { // max 2 login attemtps
            login_attempts++
            authenticate()
            mp.utils.write_file("file://" + token_file, credentials["token"])
            return download()

        } else {
            exit()
            mp.osd_message(JSON.stringify(dlinfo), 30)
            mp.utils.write_file("file://" + token_file, '')
            return
        }
    }

    if (!!dlinfo.msg) {
        mp.osd_message(JSON.stringify(dlinfo.msg))
        mp.commandv("sub-add", dlinfo.tmp_path)
    }

    login_attempts = 0
    mp.set_property('sub-auto', 'fuzzy')
    mp.commandv('rescan_external_files', 'reselect')
    DrawOSD()
}

function exit() {
    ov.remove()
    mp.remove_key_binding("next")
    mp.remove_key_binding("previous")
    mp.remove_key_binding("download")
    mp.remove_key_binding("guessit")
    mp.remove_key_binding("exit")
}