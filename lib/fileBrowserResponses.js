// fileBrowserResponses.js - filebrowser-enhanced's module
// author: brettz9

/*globals exports, require */

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
    l('here at least');
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
        var file, path,
            res = '';
        if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
            file = fp.file;
            path = file.path;
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
        var file = fp.file;
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

exports.autocompleteValues = function (data, emit) {

    var optValues,
        userVal = data.value,
        dir = file.dirname(userVal),
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
