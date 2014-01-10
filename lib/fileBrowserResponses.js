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
    file = require('sdk/io/file');

function getFile (path) {
    var localFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    localFile.initWithPath(path);
    return localFile;
}

exports.getNativePathFromFileURL = function (fileURL) {
    // var ph = Cc['@mozilla.org/network/protocol;1?name=file'].createInstance(Ci.nsIFileProtocolHandler);
    // return ph.getFileFromURLSpec(fileURL).path;
    return url.toFilename(fileURL);
};
exports.getFileURLFromNativePath = function (aPath) {
    return url.fromFilename(aPath);
};
exports.pathExists = function (attemptedNewPath) {
    return file.exists(attemptedNewPath);
    // var localFile = getFile(attemptedNewPath);
    // return localFile.exists();
};
exports.reveal = function (path) {
    var localFile = getFile(path);
    localFile.reveal();
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
