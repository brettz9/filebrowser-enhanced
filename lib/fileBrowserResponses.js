// fileBrowserResponses.js - filebrowser-enhanced's module
// author: brettz9
/*globals exports, require */
/*jslint vars:true, todo:true*/

// Todo: Waiting on https://github.com/mozilla/addon-sdk/pull/1220 to see if we can replace a chrome dependency with sdk/io/file reveal calls?

(function () {'use strict';

function l(msg) {
    console.log(msg);
}

var chrome = require('chrome'),
    Cc = chrome.Cc,
    Ci = chrome.Ci,
    url = require('sdk/url'),
    file = require('sdk/io/file'),
	historySearch = require('sdk/places/history').search,
	bookmarksSearch = require('sdk/places/bookmarks').search,
    requireJSM = require('./requireJSM'),
    scriptSecurityManager = Cc['@mozilla.org/scriptsecuritymanager;1'].createInstance(Ci.nsIScriptSecurityManager);

function getFile (path) {
    var localFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    localFile.initWithPath(path);
    return localFile;
}

function picker (dirPath, emit, selectFolder) {
    // Note: could use https://developer.mozilla.org/en-US/docs/Extensions/Using_the_DOM_File_API_in_chrome_code
    //         but this appears to be less feature rich
    var dir,
        windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator),
        nsIFilePicker = Ci.nsIFilePicker,
        fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

    if (!selectFolder) {
        fp.defaultExtension = 'ico';
        //fp.appendFilter('ICO (.ico)', '*.ico');
        //fp.appendFilter('SVG (.svg)', '*.svg');
        //fp.appendFilter('Icon file', '*.ico; *.svg');
        fp.appendFilter('Icon file', '*.ico');
    }

    if (dirPath) {
        try {
            dir = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            dir.initWithPath(dirPath);
            fp.displayDirectory = dir;
        }
        catch(e) {
            l('initWithPath error: '+ e);
        }
    }
    fp.init(
        windowMediator.getMostRecentWindow(null),
        selectFolder ? "Pick a folder for the executable" : "Pick an icon file",
        selectFolder ? nsIFilePicker.modeGetFolder : nsIFilePicker.modeOpen
    );

    fp.open({done: function (rv) {
        var aFile, path,
            res = '';
        if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
            aFile = fp.file;
            path = aFile.path;
            res = path;
        }
        if (selectFolder) {
            emit('dirPickResult', {path: res, i: selectFolder});
        }
        else {
            emit('filePickResult', res);
        }
        return false;
    }});
    /*
    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        var aFile = fp.file;
        var path = fp.file.path;

    }*/
}

exports.dirPick = function (data, emit) {
    picker(data.dirPath, emit, data.i);
};

exports.filePick = picker;

function getNativePathFromFileURL (fileURL) {
    // var ph = Cc['@mozilla.org/network/protocol;1?name=file'].createInstance(Ci.nsIFileProtocolHandler);
    // return ph.getFileFromURLSpec(fileURL).path;
    return url.toFilename(fileURL);
}

exports.getNativePathFromFileURL = getNativePathFromFileURL;
exports.getFileURLFromNativePath = function (aPath) {
    return url.fromFilename(aPath);
};
exports.pathExists = function (attemptedNewPath) {
    return file.exists(attemptedNewPath);
    // var localFile = getFile(attemptedNewPath);
    // return localFile.exists();
};

exports.reveal = function (path) {
    scriptSecurityManager.checkLoadURIStrWithPrincipal(path, scriptSecurityManager.getSubjectPrincipal()); // Per code review, needed before allowing arbitrary websites to launch or reveal file URLs (note, however, that only the user can initiate this!)
    var localFile = getFile(path);
    localFile.reveal();
};

exports.launch = function (fileURL) {
    scriptSecurityManager.checkLoadURIStrWithPrincipal(fileURL, scriptSecurityManager.getSubjectPrincipal()); // Per code review, needed before allowing arbitrary websites to launch or reveal file URLs (note, however, that only the user can initiate this!)
    var path = getNativePathFromFileURL(fileURL);
    getFile(path).launch();
};

/*
https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_history
https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_bookmarks
http://kb.mozillazine.org/Browser.urlbar.default.behavior
http://kb.mozillazine.org/Location_Bar_search
https://support.mozilla.org/en-US/kb/awesome-bar-find-your-bookmarks-history-and-tabs
https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Querying
https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsINavHistoryService#getNewQuery%28%29
https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsINavHistoryQuery
https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsINavHistoryQueryOptions#Sorting_methods
https://github.com/brettz9/addon-sdk/blob/b46123304ca3eabc5b5403f92fc7fb2ce1c5292a/lib/sdk/places/utils.js#L208
*/
exports.autocompleteValues = function (data, emit) {

    var optValues,
        userVal = data.value;

	// Todo: per user suggestion, try https://addons.mozilla.org/en-US/firefox/addon/vimperator/ or https://addons.mozilla.org/en-US/firefox/addon/pentadactyl/ for awesome bar inspiration
	if (!userVal.match(/^(?:[a-z]:|\/|\\|file:.*\s.)/)) {
		// Todo: Also support the last option with file: at beginning separated by a space and then a search term (also check for vice versa and treat spaces as separate items if query does not already)
		var query = {
			// url: 'file:',
			url: '*.', // this gets stripped off and becomes the empty string which with domainIsHost as false prompted by the asterisk, should only search local files // Todo: determine how to deal with folders (including those with different GET params!)
			query: userVal // In title or URL per comment at https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/places_history#Example
		};
		bookmarksSearch([ // OR'd across object (AND'd within an object)
			query,
			{url: 'file:', title: userVal}, // Bookmark title may differ from what is apparently the page title searched under "query"?
			{url: 'file:', tags: [userVal]} // Tag title may differ from bookmark or page title
		], {
			sort: 'date', // Todo: Get rid of sorting if we end up sorting ourselves to combine bookmarks and history
			count: 5
			//, descending: true
		}).on('end', function (bookmarks) {
//console.dir(bookmarks);
			var remaining = 10 - bookmarks.length;
			historySearch(query, {
				sort: 'date',
				count: remaining
				//, descending: true
			}).on('end', function (history) {
			console.dir(history);
				var items = bookmarks.concat(history).sort(function (item) {
					return item.date;
				});
//				l(items);
				// Todo: reconcile with rest of function to emit() an event instead of returning one
			});
		});
		// Temporary hack to avoid errors
		return {
			listID: data.listID,
			optValues: [userVal],
			userVal: userVal // Just for debugging on the other side
		};
	}
    l('wth:'+userVal);
	var dir = file.dirname(userVal),
        base = file.basename(userVal);
	if (file.exists(userVal)) {
        if (userVal.match(/(?:\/|\\)$/)) {
            optValues = file.list(userVal).map(function (fileInDir) {
                return file.join(userVal, fileInDir);
            });
        }
        else {
            optValues = [userVal];
        }
    }
    else if (file.exists(dir)) {
        optValues = file.list(dir).filter(function (fileInDir) {
            return fileInDir.indexOf(base) === 0;
        }).map(function (fileInDir) {
            return file.join(dir, fileInDir);
        });
    }

    optValues = data.dirOnly ?
        optValues.filter(function (optValue) {
            try {
                return getFile(optValue).isDirectory();
            }
            catch (e) {
                return false;
            }
        }) :
        optValues;

    return {
        listID: data.listID,
        optValues: optValues,
        userVal: userVal // Just for debugging on the other side
    };

};



}());
