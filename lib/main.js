/*globals exports, require */
/*jslint todo: true*/
/**
* This is an active module of the filebrowser-enhanced Add-on
*/

(function () {'use strict';

function l(msg) {
    console.log(msg);
}

exports.main = function() {

    var data = require('sdk/self').data,
        pageMod = require('sdk/page-mod'),
        MatchPattern = require('sdk/page-mod/match-pattern').MatchPattern,
        relayResponse = require('./relayResponse'),
        fileBrowserResponses = require('./fileBrowserResponses');
    
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

};

}());
