var credentials = require('./credentials');
var settings = require('./settings');

var keybinding = settings.keybinding;
mp.add_key_binding(keybinding, "start", start);
var sublistdown = [];

function printoverlay(toprint, opt) {
    var s = "";
    if (!!opt && !!opt.append) var s = ov.data;
    for (var d = 0; d < toprint.length; d++) {
        for (var i = 0; i < toprint[d].length; i++) {
            s += "{\\fscx60}{\\fscy60}" + toprint[d][i] + "\\h";
        }
        s += '\n';
    }
    ov.data = s;
    ov.update(s);
}

function authenticate() {

    var output = [["{\\an5}{\\b1}", "logging in"]];
    printoverlay(output);
    var script = mp.utils.join_path(scriptpath, "login.ps1");
    var o = {
        consumerkey: credentials.consumerkey,
        username: credentials.username,
        password: credentials.password
    };
    var logindetails = { args: ["powershell.exe", "-executionpolicy", "bypass", "-File", script, JSON.stringify(o)] };
    var logindata = mp.utils.subprocess(logindetails);
    var logininfo = JSON.parse(logindata.stdout);

    if (logininfo.status !== 200) {
        return;
    }
    credentials.token = logininfo["token"];
    var output = [["{\\an5}{\\b1}", "Logged in as userid:", logininfo["user"]["user_id"], "(" + logininfo["user"]["level"] + ")"]];
    printoverlay(output);
}

function start() {

    mp.register_event("file-loaded", exit);
    //these are global
    item = 0;
    login_attempts = 0;
    scriptpath = mp.get_script_directory();
    ov = mp.create_osd_overlay("ass-events");
    filepath = mp.get_property("path");
    mediatitle = mp.get_property('media-title');
    data = null;
    id = undefined;
    
    var output = [["{\\an5}{\\b1}", "Opensubtitle Searching", "{\\an2}", "{\\b1}{\\1c&H0000FF&}", "e{\\1c}{\\b0}xit"]];
    printoverlay(output);
    mp.add_key_binding("e", "exit", exit);
    var options = { 'title': mediatitle };
    fetch(options);
}


function guessit() {
    var output = [["{\\an5}{\\b1}", "searching by filename..."]];
    printoverlay(output);
    var script = mp.utils.join_path(scriptpath, "guessit.ps1");
    var o = {
        consumerkey: credentials.consumerkey,
        token: credentials.token,
        filepath: filepath
    };
    var guessdetails = { args: ["powershell.exe", "-executionpolicy", "bypass", "-File", script, JSON.stringify(o)] };
    var runguessit = mp.utils.subprocess(guessdetails);
    var guessitdata = JSON.parse(runguessit.stdout);
    if (!!guessitdata.error) {
        mp.osd_message(JSON.stringify(data), 15);
        exit();
        return;
    }

    var options = {
        year: guessitdata.year,
        type: guessitdata.type,
        title: guessitdata.title
    };

    fetch(options);
}

function fetch(options) {

    var script = mp.utils.join_path(scriptpath, "fetch.ps1");
    var o = {
        consumerkey: credentials.consumerkey,
        token: credentials.token,
        filepath: filepath,
        options: options,
        languages: settings.languages
    };

    var fetchdetails = { args: ["powershell.exe", "-executionpolicy", "bypass", "-File", script, JSON.stringify(o)] };
    var fetchdata = mp.utils.subprocess(fetchdetails);
    data = JSON.parse(fetchdata.stdout);
    if (!!data.error) {
        mp.osd_message(JSON.stringify(data), 15);
        exit();
        return;
    }

    mp.add_key_binding("n", "next", next);
    mp.add_key_binding("p", "previous", previous);
    mp.add_key_binding("d", "download", download);
    mp.add_key_binding("t", "guessit", guessit);
    ov.remove();
    DrawOSD();

}

function formatBooleans(isbool) {
    return isbool ? '{\\1c&H00FF00&}' + isbool + '{\\1c}' : isbool;
}

function DrawOSD() {

    if (!!data == false || data["data"].length == 0) {
        output = [["{\\an2}", "No Results Found...", "{\\b1}{\\1c&H0000FF&}", "t{\\1c}{\\b0}ry filename", "{\\b1}{\\1c&H0000FF&}", "e{\\1c}{\\b0}xit"]];

        printoverlay(output, { append: true });
        return;
    }
    var selectedsub = data["data"][item]['attributes'];

    id = selectedsub['files'][0]["file_id"];
    var filename_sub = selectedsub['files'][0]['file_name'];
    var uploaded_name = selectedsub['uploader']["name"];
    var ismoviehash_match = selectedsub["moviehash_match"];
    var uploader_rank = selectedsub['uploader']["rank"];
    var feature_title = selectedsub['feature_details']['title'];
    var feature_year = selectedsub['feature_details']['year'];
    var feature_type = selectedsub['feature_details']['feature_type'];
    var sublanguage = selectedsub['language'];

    var ishd = selectedsub["hd"];
    var isforeign_parts_only = selectedsub["foreign_parts_only"];
    var ishearing_impired = selectedsub["hearing_impaired"];

    var machine_translated = selectedsub["hearing_impaired"];
    var ai_translated = selectedsub["ai_translated"];

    function isSubdownloaded() {
        for (var s = 0; s < sublistdown.length; s++) {
            if (sublistdown[s].toString().trim() == id.toString().trim()) {
                return "{\\1c&H00FF00&}" + (item + 1) + "{\\1c}";
            }
        }
        return (item + 1);
    }
    var isdlnum = isSubdownloaded();
    var output = [
        ["{\\b1}", isdlnum + '/' + data["data"].length, "{\\b0}"],
        ["{\\b1}", "Subtitle:", "{\\b0}", filename_sub],
        ["{\\b1}", "Moviehash Match:", "{\\b0}", formatBooleans(ismoviehash_match), "{\\b1}", "Sub Language:", "{\\b0}", sublanguage],
        ["{\\b1}", "Sub id:", "{\\b0}", id, "{\\b1}", "Uploaded By:", "{\\b0}", uploaded_name, "(" + uploader_rank + ")"],
        ["{\\b1}", "HD:", "{\\b0}", formatBooleans(ishd), "{\\b1}", "Foriegn Parts Only:", "{\\b0}", formatBooleans(isforeign_parts_only), "{\\b1}", "Hearing Impaired:", "{\\b0}", formatBooleans(ishearing_impired)],
        ["{\\b1}", "Title:", "{\\b0}", feature_title],
        ["{\\b1}", "Year:", "{\\b0}", feature_year, "{\\b1}", "Type:", "{\\b0}", feature_type],
    ];

    printoverlay(output);

    var sub_rating = selectedsub['ratings'];
    var sub_dlcount = selectedsub['download_count'];
    var sub_votes = selectedsub['votes'];

    var output = [["{\\b1}", "Sub Rating:", "{\\b0}", sub_rating, "{\\b1}", "Downloads:", "{\\b0}", sub_dlcount, "{\\b1}", "Votes:", "{\\b0}", sub_votes]];

    printoverlay(output, { append: true });

    var entry = [];
    if (machine_translated){
        entry.push("{\\b1}", "Machine Translated:", "{\\b0}", formatBooleans(machine_translated));
    }
        
    if (ai_translated){
        entry.push("{\\b1}", "AI Translated:", "{\\b0}", formatBooleans(ai_translated));
    }
        

    var output = [entry];
    printoverlay(output, { append: true });

    var output = [["{\\an2}", "{\\b1}{\\1c&H0000FF&}", "t{\\1c}{\\b0}ry filename", "{\\b1}{\\1c&H0000FF&}", "{\\b1}{\\1c&H0000FF&}", "d{\\1c}{\\b0}ownload and load", "{\\b1}{\\1c&H0000FF&}", "n{\\1c}{\\b0}ext", "{\\b1}{\\1c&H0000FF&}", "p{\\1c}{\\b0}revious", "{\\b1}{\\1c&H0000FF&}", "e{\\1c}{\\b0}xit"]];

    printoverlay(output, { append: true });

    if (settings.autodlMovieHashMatch && ismoviehash_match && item == 0) {
        settings.autodlMovieHashMatch = false;
        download();
    }
}

function next() {
    item++;
    if (item < data['data'].length) {
        DrawOSD();
        return;
    } item = data['data'].length -1;
}

function previous() {
    item--;
    if (item >= 0) {
        DrawOSD();
        return;
    } item = 0;
}

function download() {
    var token_file = mp.utils.join_path(scriptpath, "token");
    var token = mp.utils.read_file(token_file);
    if (!!token == false) {
        authenticate();
        mp.utils.write_file("file://" + token_file, credentials.token);
        token = credentials.token;
    }

    var output = [["{\\an5}", "downloading..."]];
    printoverlay(output, { append: true });
    var script = mp.utils.join_path(scriptpath, "download.ps1");
    var file_id = id.toString().trim();
    var o = {
        consumerkey: credentials.consumerkey,
        token: token,
        filepath: filepath,
        file_id: file_id,
        title: mediatitle,
        toTemp: settings.alwaysDltoTemp
    };
    var fetchdetails = { args: ["powershell.exe", "-executionpolicy", "bypass", "-File", script, JSON.stringify(o)] };
    var fetchsub = mp.utils.subprocess(fetchdetails);
    var dlinfo = JSON.parse(fetchsub.stdout);
    if (!!dlinfo.error) {
        if ((dlinfo.error == 403 || dlinfo.error == 401) && login_attempts <= 1) { // max 2 login attemtps
            login_attempts++;
            authenticate();
            mp.utils.write_file("file://" + token_file, credentials.token);
            return download();

        } else {
            mp.msg.error(JSON.stringify(dlinfo));
            exit();
            return;
        }
    }

    if (!!dlinfo.msg) {
        mp.osd_message(JSON.stringify(dlinfo.msg));
        mp.commandv("sub-add", dlinfo.tmp_path);
    }


    login_attempts = 0;
    mp.set_property('sub-auto', 'fuzzy');
    mp.commandv('rescan_external_files', 'reselect');
    sublistdown.push(o.file_id);
    DrawOSD();
}


function getCurrentSubList(){
    //todo: show as downloaded if matching subid exists in filename
    existingsubs = []

    subs = mp.get_property_native('track-list')
    // mp.msg.info(JSON.stringify(S))
    for(var s = 0; s < subs.length; s++) {
        if(subs[s].type == "sub"){
            existingsubs.push(subs[s].type)
        }
    }
}

function exit() {
    ov.remove();
    mp.remove_key_binding("next");
    mp.remove_key_binding("previous");
    mp.remove_key_binding("download");
    mp.remove_key_binding("guessit");
    mp.remove_key_binding("exit");
}