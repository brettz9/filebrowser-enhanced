/*globals exports, require */
/*jslint todo: true, regexp:true */
/**
* This is an active module of the filebrowser-enhanced Add-on
*/

(function () {'use strict';

function l(msg) {
    console.log(msg);
}

exports.main = function() {

    var cm = require('sdk/context-menu'),
        tabs = require('sdk/tabs'),
        file = require('sdk/io/file'),
        url = require('sdk/url'),
        data = require('sdk/self').data,
        clipboard = require('sdk/clipboard'),
        pageMod = require('sdk/page-mod'),
        // MatchPattern = require('sdk/util/match-pattern').MatchPattern,
        relayResponse = require('./relayResponse'),
        fileBrowserResponses = require('./fileBrowserResponses'),
        cmItem = cm.Item({
            label: 'Copy native path',
            context: cm.SelectorContext('a[href]'),
            contentScriptFile: data.url('cm-get-native-path.js'),
            onMessage: function (href) {
                clipboard.set(fileBrowserResponses.getNativePathFromFileURL(href), 'text');
            }
        }),
        widget = require('sdk/widget').Widget({
            id: 'reveal-directory',
            label: 'Reveal parent directory',
            contentURL: data.url('Yellow_folder_icon_closed.html'),
            width: 0,
            onClick: function (e) {
                l('clicked' + tabs.activeTab.url);
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
            label: 'Copy path',
            tooltip: 'Click to get current file path; right-click to get path of containing folder',
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

    pageMod.PageMod({
        include: 'file://*', // new MatchPattern(/file:[^.]*    /), // not working for some reason
        contentScriptFile: [data.url('jml.js'), data.url('directoryMod.js')],
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
    });
    
    // Observe tab switch or document changes in each existing tab:
    function updateWidgetState(tab) {
        var fileWithExtension,
            view = widget.getView(tab.window),
            copyPathView = copyPath.getView(tab.window);
        if (!view || !copyPathView) {
            return;
        }
        // Update widget displayed text:
        fileWithExtension = tab.url.match(/^file:/);
        if (fileWithExtension) {
            view.contentURL = data.url('Yellow_folder_icon_open.html');
            view.width = 16;
            copyPathView.content = 'Copy path';
            copyPathView.width = 65;
        }
        else {
            view.contentURL = data.url('Yellow_folder_icon_closed.html');
            view.width = 0;
            copyPathView.content = ' ';
            copyPathView.width = 0;
        }
    }
    tabs.on('ready', updateWidgetState);
    tabs.on('activate', updateWidgetState);

};

}());
