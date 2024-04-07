
var settings = {
	minimalInterface: false, // hide  detail from the interface
    languages: "en", // list of prefered languages, format:  "en,cn,ar"
    keybinding: "ctrl+shift+o", // keybinding to launch this script
    alwaysDltoTemp: false, //if true always download to temp rather then save to folder

    allowMachineTranslations: false, // Allow Machine Translations. 
    allowAItranslations: true, // AI translations. These *should* be better then Machine translations. 
    
    autodlMovieHashMatch: false, //if true and first result matches moviehash then auto download
};

module.exports = settings;
