
var settings = {
    minimalInterface: true, // hide  detail from the interface
    languages: "en", // list of prefered languages, format:  "en,cn,ar"
    keybinding: "ctrl+shift+o", // keybinding to launch this script
    alwaysDltoTemp: false, //if true always download to temp rather then save to folder

    allowMachineTranslations: "include", // include/exclude Allow Machine Translations. 
    allowAItranslations: "include", // include/exclude AI translations. These *should* be better then Machine translations. 
    autodlMovieHashMatch: false, //if true and first result matches moviehash then auto download
};

module.exports = settings;
