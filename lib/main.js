/*globals exports, require, console */
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
        ui = require('sdk/ui'),
        data = require('sdk/self').data,
        clipboard = require('sdk/clipboard'),
        pageMod = require('sdk/page-mod'),
        // MatchPattern = require('sdk/util/match-pattern').MatchPattern,
        relayResponse = require('./relayResponse'),
        fileBrowserResponses = require('./fileBrowserResponses'), // todo: abstract/i18nize
        revealDirectory,
        openRevealDirectory = function () {
            return revealDirectory || ui.ActionButton({
                id: 'reveal-directory',
                label: _("Reveal_parent_directory"),
                icon: data.url('Yellow_folder_icon_open.png'),
                onClick: function (e) {
                    // l('clicked' + tabs.activeTab.url);
                    try {
                        if (!tabs.activeTab.url.match(/file:/)) {
                            return;
                        }
                        var fileName = fileBrowserResponses.getNativePathFromFileURL(tabs.activeTab.url);
                        var dir = file.dirname(fileName);
                        fileBrowserResponses.reveal(dir || fileName);
                    }
                    catch(err) {
                        l(err);
                    }
                }
            });
        },
        copyPath,
        openCopyPath = function () {
            return copyPath || ui.ActionButton({
                id: 'copy-path',
                icon: data.url('copy_path.png'),
                label: _("Copy_path"),
                onClick: function (e) {
                    var href = tabs.activeTab.url;
                    clipboard.set(fileBrowserResponses.getNativePathFromFileURL(href), 'text');
                }
            });
        },
        copyDirectoryPath,
        openCopyDirectoryPath = function () {
            return copyDirectoryPath || ui.ActionButton({
                id: 'copy-directory-path',
                icon: data.url('copy_directory_path.png'),
                label: _("Copy_directory_path"),
                onClick: function (e) {
                    var href = tabs.activeTab.url;
                    var fileName = fileBrowserResponses.getNativePathFromFileURL(href);
                    clipboard.set(file.dirname(fileName) || fileName, 'text');
                }
            });
        };
    
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
            fileBrowserResponses.getFile(path).reveal();
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

    function destroyCopyDirectoryPath () {
        if (copyDirectoryPath) {
            copyDirectoryPath.destroy();
            copyDirectoryPath = null;
        }
    }
    
    // Observe tab switch or document changes in each existing tab:
    function updateRevealDirectoryState(tab) {
		// We don't care about a different activeTab if opened in background
		if (tab.url !== tabs.activeTab.url) {
			return;
		}
        var isFileURL = tabs.activeTab.url.match(/^file:/);
        // Update revealDirectory displayed text:
        if (isFileURL) {
            // var isDir = fileBrowserResponses.getFile(fileBrowserResponses.getNativePathFromFileURL(tab.url)).isDirectory();
            revealDirectory = openRevealDirectory();
            copyPath = openCopyPath();
			// We don't need a parent if we are at root
            if (!file.dirname(fileBrowserResponses.getNativePathFromFileURL(tabs.activeTab.url))) {
                destroyCopyDirectoryPath();
            }
            else {
                copyDirectoryPath = openCopyDirectoryPath();
            }
        }
        else {
            if (revealDirectory) {
                revealDirectory.destroy();
                revealDirectory = null;
            }
            if (copyPath) {
                copyPath.destroy();
                copyPath = null;
            }
            destroyCopyDirectoryPath();
        }
    }
    tabs.on('ready', updateRevealDirectoryState);
    tabs.on('activate', updateRevealDirectoryState);

};

}());
