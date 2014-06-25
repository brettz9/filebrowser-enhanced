/*globals self, jml, JawBar, console, window, document, location*/
/*jslint vars:true, todo:true*/
(function () {
    'use strict';

function l(msg) {
    console.log(msg);
}
function $ (sel) {
    return document.querySelector(sel);
}

var gTable = document.querySelector('table');
if (!gTable || !document.querySelector('#UI_showHidden')) { // Exit as we don't want to continue inside a rendered file and can't accurately filter context menu by selector
    return;
}
var i,
    headCells = gTable.tHead.rows[0].cells,
    gTBody = gTable.tBodies[0],
    cellLinks = gTBody.querySelectorAll('td > a');

function getParam(name) {
    name = name.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<\>\|\:])/g, '\\$1');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'), // Todo: encodeURIComponent?
        results = regex.exec(location.search);
    return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' ')); // todo: + replace needed here?
}

var sort = getParam('sort');
var asc = getParam('asc');
asc = asc !== 'false';

var avoidDouble = false;

// Todo: add query string also to directory links!
function rowAction (i) {
    return function (e) {
        if (!avoidDouble) { // && (sort !== String(i))) { // || asc !== Boolean(asc))) {
            asc = !asc;
            window.location.assign(window.location.href.replace(/\?.*$/, '') + '?sort=' + i + '&asc=' + asc);
        }
    };
}

// We need to wait for DOMContentLoaded since the content script loads before the page script,
//  and we need to first ensure the header links are added by the page script.
document.addEventListener('DOMContentLoaded', function() {
    if (sort) {
        var queryString = '?sort=' + sort + '&asc=' + asc;
        var up = $('.up');
        if (up) { // Not present at top level
            up.href += queryString;
        }
        Array.slice(cellLinks).forEach(function (cellLink) {
            if (cellLink.href.slice(-1) === '/') { // Add current sorting to directory paths
                cellLink.href += queryString;
            }
        });
        
        if (asc === false) {
            avoidDouble = true;
            headCells[sort].click();
            avoidDouble = false;
        }
        headCells[sort].click();
    }

    for (i = headCells.length - 1; i >= 0; i--) {
        headCells[i].addEventListener('click', rowAction(i), true);
    }

});

// self.port.emit(name, jsonSerializableData);
// self.port.on/once/removeListener(name, function () {}); // self.on is used instead for built-in message listening

var jbar,
    on = self.port.on,
    emit = self.port.emit,
    options = self.options;

on('getNativePathFromFileURLIfADirectory', function (nativePath) {
    
    on('selectInput', function () {
        $('#pathBox').select();
        $('#pathBox').focus();
    });
    on('getFileURLFromNativePathResponse', function (fileURL) {
        window.location.href = fileURL;
    });
    on('dirPickResult', function (data) {
        if (data.path) {
            emit('getFileURLFromNativePath', data.path);
        }
    });
    on('autocompleteValuesResponse', function (data) {
        // l(data.userVal);
        // Real Awesome Bar includes: icon, title + keyword icon, URL, tags, bookmark star
        /*
        Properties:
            History: 'title', 'url', 'keyword', // 'date', 'visitCount', 'dateAdded' and 'lastModified
            Bookmarks: 'title', 'url', 'tags', // 'group', 'index', 'updated'
        */
        // Convert Set (of tags) to array:  [v for (v of mySet)] // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
        var jbarOpts = data.optValues.map(function (optValue) {
            return {
                text: optValue.title, // + optValue.keyword,
                subtext: optValue.url, // +tags, +bookmark star if a bookmark (todo: add bookmark group/updated or history visitCount/dateAdded/lastModified via tooltip?)
                icon: optValue.favicon,
                searchValue: optValue.title + ' ' + optValue.url,
                displayValue: optValue.url
            };
        });
        if (jbar) {
//            jbar.remove().add(jbarOpts);
        }
        else {
            jbar = new JawBar('#pathBox', jbarOpts);
        }
    });
    var h1 = $('h1');
    while (h1.firstChild) {
        h1.removeChild(h1.firstChild);
    }
    h1.appendChild(document.createTextNode('Index of '));
    h1.appendChild(jml(
        'input', {
            type: 'text', id: 'pathBox', autocomplete: 'off', autofocus: 'autofocus',
            size: 95, value: nativePath,
            $on: {
                change: function (e) {
                    on('pathExistsResponse', function (pathExists) {
                        if (pathExists) {
                            emit('getFileURLFromNativePath', e.target.value);
                        }
                    });
                    emit('pathExists', e.target.value);
                },
                input: function (e) {
                    emit('autocompleteValues', {
                        value: e.target.value,
                        listID: e.target.getAttribute('list')
                    });
                }
            }
        },
        'button', {$on: {click: function () {
            emit('dirPick', {dirPath: $('#pathBox').value, i: '1'});
        }}}, [
            'Browse\u2026'
        ],
        'input', {
                type: 'button',
                style: 'border: none; margin-left: 5px; background-color: transparent; width: 25px; background-repeat: no-repeat; '+
                        'background-size: 20px 20px; '+
                        'background-image: url("' + options.folderImage + '");',
                $on: {click: function () {
                    emit('reveal', nativePath);
                }}
            }, null
    ));
    var input = $('#pathBox');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
});
    /*window.addEventListener('click', function (e) {
        var el;
        if (e.button === 2) {
            el = e.target;
            emit('getNativePathFromFileURL', [el.href]);
        }
    });*/

}());
