/*globals exports, require */
/*jslint todo: true*/
/**
* This is an active module of the filebrowser-enhanced Add-on
*/

(function () {
    'use strict';

function l(msg) {
    console.log(msg);
}

exports.main = function() {

    var tabs = require('sdk/tabs'),
        file = require('sdk/io/file'),
        url = require('sdk/url'),
        data = require('sdk/self').data,
        pageMod = require('sdk/page-mod'),
        // MatchPattern = require('sdk/util/match-pattern').MatchPattern,
        relayResponse = require('./relayResponse'),
        fileBrowserResponses = require('./fileBrowserResponses'),
        widget = require('sdk/widget').Widget({
          id: 'reveal-directory',
          label: 'Reveal directory',
          contentURL: data.url('Yellow_folder_icon_closed.html'),
          width: 0,
          onClick: function () {
              l('clicked' + tabs.activeTab.url);
              try {
                if (!tabs.activeTab.url.match(/file:/)) {
                    return;
                }
                var dir = file.dirname(url.toFilename(tabs.activeTab.url));
                fileBrowserResponses.reveal(dir);
              }
              catch(e) {
              }
          }
        });
    
    pageMod.PageMod({
      include: 'file://*', // new MatchPattern(/file:[^.]*  /), // not working for some reason
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
        view = widget.getView(tab.window);
      if (!view) {
        return;
      }
      // Update widget displayed text:
      fileWithExtension = tab.url.match(/^file:.*\./);
      view.contentURL = fileWithExtension ? data.url('Yellow_folder_icon_open.html') : data.url('Yellow_folder_icon_closed.html');
      view.width = fileWithExtension ? 16 : 0;
    }
    tabs.on('ready', updateWidgetState);
    tabs.on('activate', updateWidgetState);

};

}());
