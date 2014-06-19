/*globals exports, require */
/*jslint todo: true, regexp:true, vars: true */
/**
* This is an active module of the filebrowser-enhanced Add-on
*/

(function () {'use strict';

function l(msg) {
    console.log(msg);
}

exports.main = function() {

    var copyNativePath, execute,
        chrome = require('chrome'),
        Cc = chrome.Cc,
        Ci = chrome.Ci,
        _ = require('sdk/l10n').get,
        simplePrefs = require('sdk/simple-prefs'),
        prefs = simplePrefs.prefs,
        cm = require('sdk/context-menu'),
        tabs = require('sdk/tabs'),
        file = require('sdk/io/file'),
        url = require('sdk/url'),
        data = require('sdk/self').data,
        clipboard = require('sdk/clipboard'),
        pageMod = require('sdk/page-mod'),
        // MatchPattern = require('sdk/util/match-pattern').MatchPattern,
        relayResponse = require('./relayResponse'),
        fileBrowserResponses = require('./fileBrowserResponses'), // todo: abstract/i18nize
        revealDirectory = require('sdk/widget').Widget({
            id: 'reveal-directory',
            label: _("Reveal_parent_directory"),
            contentURL: data.url('Yellow_folder_icon_closed.html'),
            width: 0,
            onClick: function (e) {
                // l('clicked' + tabs.activeTab.url);
                try {
                    if (!tabs.activeTab.url.match(/file:/)) {
                        return;
                    }
                    var dir = file.dirname(url.toFilename(tabs.activeTab.url));
                    fileBrowserResponses.reveal(dir);
                }
                catch(err) {
                }
            }
        }),
        copyPath = require('sdk/widget').Widget({
            id: 'copy-path',
            label: _("Copy_path"),
            tooltip: _("click_for_curr_path_rt_click_for_containing"),
            content: ' ',
            contentScriptFile: data.url('addonbar-copy-path.js'),
            // width: 0,
            onClick: function (e) {
                var href = tabs.activeTab.url;
                clipboard.set(url.toFilename(href), 'text');
            }
        });
    copyPath.port.on('copyDirectoryPath', function () {
        var href = tabs.activeTab.url;
        clipboard.set(file.dirname(url.toFilename(href)), 'text');
    });

    function getFile (path) {
        var localFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
        localFile.initWithPath(path);
        return localFile;
    }
    
    copyNativePath = cm.Item({
        label: _("Copy_native_path"),
        context: cm.SelectorContext('a[href]'),
        contentScriptFile: data.url('cm-get-native-path.js'),
        onMessage: function (href) {
            clipboard.set(fileBrowserResponses.getNativePathFromFileURL(href), 'text');
        }
    });
    execute = cm.Item({
        label: _("Execute"),
        context: cm.SelectorContext('a[href]'),
        contentScriptFile: data.url('cm-execute.js'),
        onMessage: function (href) {
            fileBrowserResponses.launch(href);
        }
    });
    execute = cm.Item({
        label: _("Reveal"),
        context: cm.SelectorContext('a[href]'),
        contentScriptFile: data.url('cm-reveal.js'),
        onMessage: function (href) {
            var path = fileBrowserResponses.getNativePathFromFileURL(href);
            getFile(path).reveal();
        }
    });

    var mod;
    function createMod () {
        if (mod) {
            mod.destroy();
        }
        var modOpts = {
            include: 'file://*', // new MatchPattern(/file:[^.]*    /), // not working for some reason
            contentScriptFile: [data.url('jml.js'), data.url('directoryMod.js')], // Todo: i18n-ize directoryMod.js, supplying it strings
            contentScriptWhen: 'ready',
            contentScriptOptions: { // any JSON-serializable key/values
                folderImage: data.url('Yellow_folder_icon_open.png')
            },
            //contentStyleFile: '',
            attachTo: [
                'top',
                'existing', // todo: reenable this later as very useful!
                'frame'
            ],
            onAttach: relayResponse.bind(fileBrowserResponses)()
        };
        if (prefs.conserveSpace) {
            modOpts.contentStyleFile = [data.url('directoryMod.css')];
        }
        mod = pageMod.PageMod(modOpts);
    }
    createMod();
    
    simplePrefs.on('', function (pref) {
        switch (pref) {
            case 'conserveSpace':
                createMod();
                break;
        }
    });

    
    // Observe tab switch or document changes in each existing tab:
    function updateRevealDirectoryState(tab) {
        var fileWithExtension,
            view = revealDirectory.getView(tab.window),
            copyPathView = copyPath.getView(tab.window);
        if (!view || !copyPathView) {
            return;
        }
        // Update revealDirectory displayed text:
        fileWithExtension = tab.url.match(/^file:/);
        if (fileWithExtension) {
            view.contentURL = data.url('Yellow_folder_icon_open.html');
            view.width = 16;
            copyPathView.content = _("Copy_path");
            copyPathView.width = 65;
        }
        else {
            view.contentURL = data.url('Yellow_folder_icon_closed.html');
            view.width = 0;
            copyPathView.content = ' ';
            copyPathView.width = 0;
        }
    }
    tabs.on('ready', updateRevealDirectoryState);
    tabs.on('activate', updateRevealDirectoryState);

};

}());
